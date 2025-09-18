import React, { useRef } from 'react';
import { Box, Button, Divider, Typography, IconButton, Stack } from '@mui/material';
import { MdCloudDone, MdDelete } from 'react-icons/md';
import { VIEWPORT_OFFSET, usePersistentFile, readFileFromLocalStorage } from './localStorage';

const ACCEPT_ATTR = 'image/*,application/pdf';

export default function Exibicao({ onCleared }) {
  const { fileUrl, fileName, fileType, save, clear } = usePersistentFile();
  const { remoteUrl } = readFileFromLocalStorage();
  const fileInputRef = useRef(null);

  // Se não houver arquivo salvo, o pai decide o que fazer (não auto-redirecionamos aqui)
  if (!fileUrl) return null;

  const openPicker = () => fileInputRef.current?.click();

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await save(file);
    } finally {
      e.target.value = '';
    }
  };

  const handleClear = () => {
    clear();
    onCleared?.();
  };

  // se já temos link remoto, preferir ele (abre direto do MinIO)
  const previewUrl = remoteUrl || fileUrl;

  return (
    <Box sx={{ width: '100%', height: `calc(100vh - ${VIEWPORT_OFFSET}px)`, borderRadius: 4, p: 2, mt: 2 }}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        style={{ display: 'none' }}
        onChange={handleFilePicked}
      />

      <Box sx={{ position: 'relative', height: '100%', borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 0.5, mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MdCloudDone size={22} />
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{fileName}</Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              sx={{ backgroundColor: '#fff', width: 130, fontSize: 12, color: 'black' }}
              size="small"
              variant="outlined"
              onClick={openPicker}
            >
              Trocar arquivo
            </Button>
            <IconButton color="error" onClick={handleClear} title="Remover" size="small">
              <MdDelete size={21} />
            </IconButton>
          </Stack>
        </Stack>

        <Divider />

        <Box
          sx={{
            mt: 1,
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'transparent',
            height: `calc(100% - 50px)`,
          }}
        >
          {fileType === 'image' ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Mensagem de Segurança"
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box
              component="iframe"
              title="Mensagem de Segurança (PDF)"
              src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              sx={{ width: '100%', height: '100%', border: 0 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
