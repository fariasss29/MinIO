// exibicao.jsx - Versão Simplificada (Sem botão Salvar)

import React, { useRef } from 'react';
import { Box, Button, Divider, Typography, IconButton, Stack } from '@mui/material';
import { MdCloudDone, MdDelete } from 'react-icons/md';
import { VIEWPORT_OFFSET } from './localStorage';

const ACCEPT_ATTR = 'image/*,application/pdf';

export default function Exibicao({
  fileUrl,
  fileName,
  fileType,
  onCleared,
  onFileSelected, // Prop para trocar o arquivo
}) {
  const fileInputRef = useRef(null);

  if (!fileUrl) return null;

  const openPicker = () => fileInputRef.current?.click();

  const handleFilePicked = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Chama a função do pai, que irá acionar o novo upload automaticamente
      onFileSelected(file);
    }
    e.target.value = '';
  };

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
            {/* O BOTÃO SALVAR FOI REMOVIDO */}
            <Button
              sx={{ backgroundColor: '#fff', fontSize: 12, color: 'black' }}
              size="small"
              variant="outlined"
              onClick={openPicker}
            >
              Trocar arquivo
            </Button>
            <IconButton color="error" onClick={onCleared} title="Remover" size="small">
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
              src={fileUrl}
              alt="Mensagem de Segurança"
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Box
              component="iframe"
              title="Mensagem de Segurança (PDF)"
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              sx={{ width: '100%', height: '100%', border: 0 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
