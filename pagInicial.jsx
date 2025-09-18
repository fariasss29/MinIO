import React, { useCallback, useMemo } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { MdCloudUpload } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

import {
  baseStyle,
  VIEWPORT_OFFSET,
  ACCEPT_MIME,
  saveFileToLocalStorage,
  LS_KEY_UUID,
  LS_KEY_REMOTE,
} from './localStorage';

import api from '@/services/axios'; // ajuste o caminho se necessário

export default function PagInicial({ onUploaded }) {
  const onDrop = useCallback(async (accepted, rejected) => {
    if (accepted?.length === 1 && !rejected?.length) {
      try {
        const file = accepted[0];

        // 1) preview local imediato
        await saveFileToLocalStorage(file);

        // 2) upload para o back (controller HSE: POST com "files")
        const fd = new FormData();
        fd.append('files', file);

        const up = await api.post('/gembavision/producao/hse', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const uuid = up?.data?.uuid;

        // 3) buscar URLs pré-assinadas (GET com ?uuid=...)
        let remoteUrl = null;
        if (uuid) {
          const resp = await api.get('/gembavision/producao/hse', {
            params: { uuid, expires: 300 },
          });
          remoteUrl = resp?.data?.urls?.[0]?.url || null;
        }

        // 4) persistir uuid/remote para reabrir depois
        if (uuid) localStorage.setItem(LS_KEY_UUID, uuid);
        if (remoteUrl) localStorage.setItem(LS_KEY_REMOTE, remoteUrl);

        onUploaded && onUploaded();
        toast.success('Arquivo enviado.');
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || 'Falha ao processar o arquivo.');
      }
    } else {
      const error = rejected?.[0]?.errors?.[0];
      let msg = 'Ocorreu um erro ao enviar o arquivo.';
      if (error?.code === 'file-invalid-type') msg = 'Formato inválido. Envie PDF ou imagem.';
      if (error?.code === 'too-many-files') msg = 'Envie somente um arquivo por vez.';
      toast.error(msg);
    }
  }, [onUploaded]);

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: ACCEPT_MIME,
    multiple: false,
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
  });

  const style = useMemo(() => ({ ...baseStyle }), []);

  return (
    <Box sx={{ width: '100%', height: `calc(100vh - ${VIEWPORT_OFFSET}px)`, borderRadius: 4, p: 2, mt: 2 }}>
      <Box {...getRootProps({ style })} sx={{ height: '100%' }}>
        <input {...getInputProps()} />
        <MdCloudUpload style={{ height: 40, width: 40 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Arraste e solte o arquivo aqui.
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#d4d3d3ff' }}>
          Formatos aceitos: PDF ou imagem (JPG, PNG, WEBP, GIF, SVG).
        </Typography>

        <Divider
          textAlign="center"
          sx={{
            mt: 2,
            width: '100%',
            color: '#d4d3d3',
            backgroundColor: 'transparent',
            '&::before, &::after': { borderTop: '1px solid #fff', opacity: 1 },
            '& .MuiDivider-wrapper': { backgroundColor: 'transparent' },
          }}
        >
          OU
        </Divider>

        <Button variant="contained" sx={{ mt: 2, width: 200, height: 40, fontSize: 13 }} onClick={open}>
          Buscar Arquivo
        </Button>
      </Box>
    </Box>
  );
}
