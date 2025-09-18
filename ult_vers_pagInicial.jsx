import React, { useCallback, useMemo } from 'react';
import { Box, Button, Divider, Typography } from '@mui/material';
import { MdCloudUpload } from 'react-icons/md';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

import {
  baseStyle,
  VIEWPORT_OFFSET,
  ACCEPT_MIME,
} from './localStorage'; // Não precisa mais do saveFileToLocalStorage aqui

// A prop foi alterada para refletir sua nova função
export default function PagInicial({ onFileSelected }) {
  const onDrop = useCallback(
    (accepted, rejected) => {
      if (accepted?.length === 1 && !rejected?.length) {
        // Apenas chama a função do componente pai com o arquivo selecionado
        onFileSelected(accepted[0]);
      } else {
        // A lógica de erro permanece a mesma
        const error = rejected?.[0]?.errors?.[0];
        let msg = 'Ocorreu um erro ao enviar o arquivo.';
        if (error?.code === 'file-invalid-type') msg = 'Formato inválido. Envie PDF ou imagem.';
        if (error?.code === 'too-many-files') msg = 'Envie somente um arquivo por vez.';
        toast.error(msg);
      }
    },
    [onFileSelected] // A dependência agora é a nova função
  );

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
