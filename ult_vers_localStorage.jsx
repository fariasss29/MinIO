import { useState } from 'react';
import toast from 'react-hot-toast';

// --- Constantes públicas (pode reaproveitar) ---
export const VIEWPORT_OFFSET = 220;
export const MAX_LOCAL_BYTES = 7 * 1024 * 1024; // ~7MB
export const ACCEPT_MIME = {
  'application/pdf': ['.pdf'],
  'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'],
};

// Chaves do localStorage
export const LS_KEY_CONTENT = 'hse:file:dataurl';
export const LS_KEY_NAME    = 'hse:file:name';
export const LS_KEY_TYPE    = 'hse:file:type';

// Estilo base da área de upload
export const baseStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'min(10vh, 120px)',
  borderWidth: 2,
  borderRadius: 6,
  borderColor: '#867e7eff',
  borderStyle: 'dashed',
  backgroundColor: '#1C2531',
  color: '#ffffffff',
  outline: 'none',
  transition: 'border .24s ease-in-out',
  position: 'relative',
};

// ---------- Utils ----------
export const isPdfFile = (file) =>
  file?.type?.includes('pdf') || file?.name?.toLowerCase().endsWith('.pdf');

export const isImageFile = (file) =>
  file?.type?.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(file?.name || '');

export const fileToDataURL = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    fr.onload = () => resolve(fr.result);
    fr.readAsDataURL(file);
  });

// ---------- API simples para salvar/ler/limpar ----------
export async function saveFileToLocalStorage(file) {
  const pdf = isPdfFile(file);
  const img = isImageFile(file);
  if (!pdf && !img) throw new Error('Formato não suportado. Envie PDF ou imagem.');
  if (file.size > MAX_LOCAL_BYTES) throw new Error('Arquivo muito grande para salvar localmente (~7MB máx).');

  const dataUrl = await fileToDataURL(file);

  try {
    localStorage.setItem(LS_KEY_CONTENT, dataUrl);
    localStorage.setItem(LS_KEY_NAME, file.name);
    localStorage.setItem(LS_KEY_TYPE, pdf ? 'pdf' : 'image');
  } catch {
    localStorage.removeItem(LS_KEY_CONTENT);
    localStorage.removeItem(LS_KEY_NAME);
    localStorage.removeItem(LS_KEY_TYPE);
    throw new Error('Sem espaço no armazenamento local.');
  }

  return { fileUrl: dataUrl, fileName: file.name, fileType: pdf ? 'pdf' : 'image' };
}

export function readFileFromLocalStorage() {
  const fileUrl = localStorage.getItem(LS_KEY_CONTENT);
  const fileName = localStorage.getItem(LS_KEY_NAME) || '';
  const fileType = localStorage.getItem(LS_KEY_TYPE);
  return { fileUrl, fileName, fileType };
}

export function clearLocalFile() {
  localStorage.removeItem(LS_KEY_CONTENT);
  localStorage.removeItem(LS_KEY_NAME);
  localStorage.removeItem(LS_KEY_TYPE);
}

// ---------- Hook com estado (hidrata SINCRONAMENTE) ----------
export function usePersistentFile() {
  const [state, setState] = useState(() => {
    const s = readFileFromLocalStorage(); // lê na 1ª render
    return { fileUrl: s.fileUrl, fileName: s.fileName || '', fileType: s.fileType || null };
  });

  const save = async (file) => {
    const res = await saveFileToLocalStorage(file);
    setState(res);
    toast.success('Arquivo carregado.');
  };

  const clear = () => {
    clearLocalFile();
    setState({ fileUrl: null, fileName: '', fileType: null });
  };

  return { ...state, save, clear };
}
