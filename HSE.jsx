import React, { useEffect, useState } from 'react';

import PagInicial from '../../../components/producao/hse/pagInicial';
import Exibicao from '../../../components/producao/hse/exibicao';
import { readFileFromLocalStorage } from '../../../components/producao/hse/localStorage';

export default function HSE() {
  const [mode, setMode] = useState(() =>
    readFileFromLocalStorage().fileUrl ? 'view' : 'upload'
  ); 

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'hse:file:dataurl') {
        setMode(e.newValue ? 'view' : 'upload');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return mode === 'upload'
    ? <PagInicial onUploaded={() => setMode('view')} />
    : <Exibicao onCleared={() => setMode('upload')} />;
}
