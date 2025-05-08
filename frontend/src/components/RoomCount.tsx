'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/filters';

// Componente para exibir uma mensagem de "Buscando..." com animação de pontos
const LoadingText: React.FC = () => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 400); // Atualiza a cada 400ms
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="text-sm text-indigo-600 font-medium">
      Buscando{dots}<span className="invisible">....</span>
    </div>
  );
};

// Componente principal para exibir a contagem total de quartos encontrados.
const RoomCount: React.FC = () => {
  // Obtém as informações de paginação e o status de loading da store Zustand.
  const { pagination, isLoading } = useFilterStore();

  // Mostra a animação "Buscando..." durante o carregamento
  if (isLoading || !pagination) {
    return <LoadingText />;
  }

  // Obtém o número total de quartos dos dados de paginação.
  const count = pagination.totalRooms;

  // Renderiza a mensagem formatada de acordo com a contagem.
  return (
    <div className="text-sm text-gray-600">
      {count === 0
        ? 'Nenhum quarto encontrado'
        : count === 1
        ? '1 quarto encontrado'
        : `${count} quartos encontrados`} { /* Pluralização simples */}
    </div>
  );
};

export default RoomCount; 