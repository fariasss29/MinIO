import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import PagInicial from '../../../components/producao/hse/pagInicial';
import Exibicao from '../../../components/producao/hse/exibicao';
import { readFileFromLocalStorage, saveFileToLocalStorage, clearLocalFile } from '../../../components/producao/hse/localStorage'; 

// NOVO: Componente para mostrar a imagem que vem do servidor
function VisualizadorServidor({ uploadId }) {
  const [file, setFile] = useState({ url: null, type: null, loading: true, error: null });

  useEffect(() => {
    if (!uploadId) {
      setFile({ loading: false, error: "ID da imagem não encontrado.", url: null, type: null });
      return;
    }

    const fetchImage = async () => {
      try {
        // Usa a rota do seu backend que retorna a URL pré-assinada
        const response = await axios.get(`/uploads/download/${uploadId}`);
        const url = response.data.urls[0]; // Pega a primeira URL do array
        const isPdf = url.includes('.pdf');

        setFile({ url, type: isPdf ? 'pdf' : 'image', loading: false, error: null });
      } catch (err) {
        setFile({ loading: false, error: "Falha ao carregar imagem do servidor.", url: null, type: null });
      }
    };
    fetchImage();
  }, [uploadId]);

  if (file.loading) return <p>Carregando imagem do servidor...</p>;
  if (file.error) return <p>{file.error}</p>;
  if (!file.url) return <p>Nenhuma imagem para exibir.</p>;

  // Reutilize a lógica de exibição que você já tem
  return (
     <Exibicao fileUrl={file.url} fileType={file.type} fileName="Imagem do Servidor" isFromServer={true} />
  );
}


export default function HSE() {
  const [mode, setMode] = useState('viewServer'); // Modos: viewServer, upload, viewLocal
  const [viewFile, setViewFile] = useState(() => readFileFromLocalStorage());
  const [activeUploadId, setActiveUploadId] = useState(null); // ID da imagem no servidor

  // Ao carregar a página, busca a imagem mais recente
  useEffect(() => {
    // --- LÓGICA PARA BUSCAR O ID DA IMAGEM ATIVA ---
    // Você precisa de uma rota no backend que retorne o ID da última imagem.
    // Ex: GET /hse/active-id  => retorna { id: 'uuid-da-imagem' }
    // Por enquanto, vamos simular que ele foi encontrado:
    // Exemplo: setActiveUploadId('c2a2b0e9-7f37-4c28-9f2d-3d4b1e6a5f7a');

    // Se você não tiver essa rota, o usuário terá que começar pela tela de upload
    if (!activeUploadId) {
        setMode('upload');
    }
  }, []);

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      // 1. Adiciona o bucket, conforme o backend exige
      formData.append('bucket', 'gembavision');
      // 2. Adiciona o arquivo no campo 'files' (plural)
      formData.append('files', file);

      toast.loading('Enviando arquivo...');
      const response = await axios.post('/documentos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.dismiss();
      toast.success('Arquivo salvo no servidor!');
      return response.data.id; // Retorna o ID do upload
    } catch (error) {
      toast.dismiss();
      toast.error('Falha ao enviar o arquivo.');
      throw error;
    }
  };

  const handleFileSelected = async (file) => {
    try {
      const newUploadId = await uploadFile(file);
      const savedForPreview = await saveFileToLocalStorage(file);
      
      setViewFile(savedForPreview);
      setActiveUploadId(newUploadId); // Guarda o novo ID ativo
      setMode('viewServer'); // Volta para a visualização do servidor com a nova imagem

    } catch (e) {
      console.log("Falha no processo de upload.");
    }
  };
  
  const handleClear = () => {
    clearLocalFile();
    setViewFile({});
    setMode('upload');
  };

  // Renderização condicional
  if (mode === 'upload') {
    return <PagInicial onFileSelected={handleFileSelected} />;
  }
  
  // Se está no modo de visualização do servidor, usa o componente VisualizadorServidor
  // que por sua vez usará o Exibicao para a parte visual
  return <VisualizadorServidor uploadId={activeUploadId} />;
}
