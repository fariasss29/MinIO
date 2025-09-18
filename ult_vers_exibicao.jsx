import React, { useRef } from 'react';
import { Box, Button, Divider, Typography, IconButton, Stack } from '@mui/material';
import { MdCloudDone, MdDelete } from 'react-icons/md';
import { VIEWPORT_OFFSET } from './localStorage'; // Ajuste o caminho se necessário

const ACCEPT_ATTR = 'image/*,application/pdf';

export default function Exibicao({
  fileUrl,
  fileName,
  fileType,
  onCleared,
  onFileSelected,
  isFromServer = false, // Nova prop para controlar a UI
}) {
  const fileInputRef = useRef(null);

  // Se não houver URL para exibir, o componente não renderiza nada.
  if (!fileUrl) return null;

  // Função para abrir o seletor de arquivos do navegador
  const openPicker = () => fileInputRef.current?.click();

  // Função chamada quando o usuário seleciona um novo arquivo para trocar
  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Chama a função do componente pai, que vai cuidar do upload automático
      onFileSelected(file);
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
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

          {/* Os botões de ação só aparecem se NÃO for uma visualização do servidor,
              ou seja, quando for um preview local antes de salvar. */}
          {!isFromServer && (
            <Stack direction="row" spacing={1}>
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
          )}
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
              alt={fileName}
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Box
              component="iframe"
              title={fileName}
              src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              sx={{ width: '100%', height: '100%', border: 0 }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
