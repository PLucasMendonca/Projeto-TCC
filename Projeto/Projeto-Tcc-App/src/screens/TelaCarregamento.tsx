import React, { useState, useEffect } from 'react';
import TelaCarregamentoBase from '../components/TelaCarregamentoBase';

type TelaCarregamentoProps = {
  mensagemCustomizada?: string;
};

export default function TelaCarregamento({ mensagemCustomizada }: TelaCarregamentoProps) {
  const [mensagemIndex, setMensagemIndex] = useState(0);

  const mensagens = [
    'Aguarde um instante...',
    'Estamos preparando tudo...',
    'Quase lá...',
    'Só mais um momento...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMensagemIndex((prevIndex) =>
        prevIndex === mensagens.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelaCarregamentoBase
      mensagem={mensagemCustomizada || mensagens[mensagemIndex]}
      animado={true}
    />
  );
}
