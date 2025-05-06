'use client';

import React from 'react';
import { useFilterStore } from '@/store/filters';

// Componente simples para exibir a contagem total de quartos encontrados.
const RoomCount: React.FC = () => {
  // Obtém as informações de paginação e o status de loading da store Zustand.
  const { pagination, isLoading } = useFilterStore();

  // Oculta o componente durante o carregamento inicial ou se os dados de paginação ainda não chegaram.
  // Isso evita mostrar "0 quartos encontrados" enquanto os dados estão sendo carregados.
  if (isLoading || !pagination) {
    // Renderiza um placeholder com altura durante o carregamento
    return (
      <div className="text-sm text-gray-600 h-5">
        <div className="h-full w-32 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  // Obtém o número total de quartos dos dados de paginação.
  const count = pagination.totalRooms;

  // Renderiza a mensagem formatada de acordo com a contagem.
  return (
    <div className="text-sm text-gray-600">
      {count === 0
        ? 'Nenhum quarto encontrado.'
        : count === 1
        ? '1 quarto encontrado.'
        : `${count} quartos encontrados.`} { /* Pluralização simples */}
    </div>
  );
};

export default RoomCount; 