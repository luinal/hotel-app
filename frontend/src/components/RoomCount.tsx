'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore } from '@/store/filters';
import { Box, Typography } from '@mui/material';

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
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'primary.main',
        fontWeight: 500,
        fontSize: 16,
      }}
    >
      Buscando{dots}<span style={{ visibility: 'hidden', fontSize: 16 }}>....</span>
    </Typography>
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
    <Typography 
      variant="body2" 
      sx={{ 
        color: 'text.secondary',
        fontWeight: 500,
        pl: 1,
        fontSize: 16,
      }}
    >
      {count === 0
        ? '+'
        : count === 1
        ? '1 quarto encontrado'
        : `${count} quartos encontrados`} { /* Pluralização simples */}
    </Typography>
  );
};

export default RoomCount; 