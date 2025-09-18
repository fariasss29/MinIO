// useCases/bps/producao/GET/GetHse.js
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export class GetHse {
  /**
   * @param {{ db: any, minio: any, bucket?: string }} deps
   */
  constructor({ db, minio, bucket = "mens-seguranca" }) {
    this.db = db;
    this.minio = minio;
    this.bucket = bucket;
  }

  /**
   * Lista últimos registros da tabela (igual seu padrão de GET).
   * Controller atual chama: this.consultarHSE.execute({ limit })
   */
  async execute({ limit = 50 } = {}) {
    const [rows] = await this.db.query(
      `SELECT uuid, nome_arquivo, bucket, mimetype, data_upload
         FROM mens_seguranca_minio
        ORDER BY data_upload DESC
        LIMIT ?`,
      [Number(limit)]
    );
    return rows;
  }

  /**
   * Sobe 1 arquivo e grava na tabela.
   * @param {{ path:string, mimetype:string, originalname?:string }} file - vindo do multer
   * @param {string=} uuid - opcional; se não vier, é criado
   * @returns {{ uuid:string, key:string, mimetype:string }}
   */
  async uploadOne(file, uuid = uuidv4()) {
    const ext = path.extname(file.originalname || "") || ".pdf";
    const key = `${uuid}-${uuidv4()}${ext}`;
    const meta = { "Content-Type": file.mimetype };

    await new Promise((resolve, reject) =>
      this.minio.fPutObject(this.bucket, key, file.path, meta, (err) =>
        err ? reject(err) : resolve()
      )
    );

    // remove tmp local (ignora erro se não existir)
    try { fs.unlinkSync(file.path); } catch {}

    await this.db.query(
      `INSERT INTO mens_seguranca_minio
         (uuid, nome_arquivo, bucket, mimetype, data_upload)
       VALUES (?, ?, ?, ?, ?)`,
      [uuid, key, this.bucket, file.mimetype, new Date()]
    );

    return { uuid, key, mimetype: file.mimetype };
  }

  /**
   * Sobe N arquivos (array do multer) sob o mesmo uuid.
   * @param {Array<{ path:string, mimetype:string, originalname?:string }>} files
   * @param {string=} uuid
   * @returns {{ uuid:string, files: Array<{key:string, mimetype:string}> }}
   */
  async uploadMany(files = [], uuid = uuidv4()) {
    const saved = [];
    for (const f of files) {
      const one = await this.uploadOne(f, uuid);
      saved.push({ key: one.key, mimetype: one.mimetype });
    }
    return { uuid, files: saved };
  }

  /**
   * Gera URLs pré-assinadas (5 min por padrão) para todos os objetos do uuid.
   * @param {string} uuid
   * @param {number=} expiresSec - segundos (ex.: 300 = 5 min)
   * @returns {{ uuid:string, urls: Array<{ url:string, key:string }> }}
   */
  async presignedUrls(uuid, expiresSec = 300) {
    const [rows] = await this.db.query(
      `SELECT bucket, nome_arquivo
         FROM mens_seguranca_minio
        WHERE uuid = ?
        ORDER BY data_upload DESC`,
      [uuid]
    );
    if (!rows.length) {
      return { uuid, urls: [] };
    }

    const urls = await Promise.all(
      rows.map(
        (r) =>
          new Promise((resolve, reject) =>
            this.minio.presignedGetObject(
              r.bucket,
              r.nome_arquivo,
              expiresSec, // ATENÇÃO: segundos (não ms)
              (err, u) => (err ? reject(err) : resolve({ url: u, key: r.nome_arquivo }))
            )
          )
      )
    );

    return { uuid, urls };
  }
}
