'use client';

import React from 'react';
import { useFilterStore, Room } from '@/store/filters';

// Componente para renderizar um único card de quarto.
// Recebe as informações do quarto via props.
const RoomCard: React.FC<{ room: Room }> = ({ room }) => (
  <div className="flex bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group overflow-hidden">
    {/* Imagem do Quarto */}
    <div className="w-48 md:w-64 h-40 md:h-48 bg-slate-100 flex-shrink-0 flex items-center justify-center relative">
      {room.imageUrl ? (
        <img 
          src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${room.imageUrl}`}
          alt={`Imagem do quarto ${room.name}`}
          className="w-full h-full object-cover" // Garante que a imagem cubra o espaço
        />
      ) : (
        <span className="text-slate-400 text-sm">Sem imagem</span>
      )}
    </div>

    {/* Conteúdo Textual */}
    <div className="p-5 flex-grow min-w-0"> 
      <h3 className="text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1.5 truncate"
          title={room.name} // Adiciona tooltip para nomes longos
      >
        {room.name}
      </h3>
      <p className="text-xl font-bold text-indigo-600 mb-2">
        R$ {room.price.toFixed(2).replace('.',',')}
        <span className="text-sm font-normal text-slate-500"> / noite</span>
      </p>
      <p className="text-sm text-slate-600 mb-3">
        Capacidade: {room.capacity} pessoa{room.capacity > 1 ? 's' : ''}
      </p>
      {room.features.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-medium text-slate-500 mb-1.5\">Comodidades:</h4>
          <div className="flex flex-wrap gap-2">
            {room.features.slice(0, 3).map((feature, index) => ( // Ajustado para 3 features para caber melhor
              <span key={index} className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                {feature}
              </span>
            ))}
            {room.features.length > 3 && ( // Ajustado para 3
                <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                    +{room.features.length - 3} mais
                </span>
            )}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Componente principal que exibe a lista de quartos ou mensagens de status.
const RoomList: React.FC = () => {
  // Obtém o estado relevante da store Zustand: lista de quartos, status de loading, erro e informações de paginação.
  const { rooms, isLoading, error, pagination } = useFilterStore();

  // --- Renderização Condicional --- //

  // 1. Estado de Carregamento:
  // Se isLoading for true, exibe uma mensagem de carregamento.
  if (isLoading) {
    // Simulação de Skeletons para o novo layout de um card por linha
    return (
      <div className="flex flex-col gap-6">
        {[...Array(3)].map((_, i) => ( // 3 Skeletons
          <div key={i} className="flex bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse overflow-hidden h-40 md:h-48"> {/* Altura definida para o skeleton */}
            <div className="w-48 md:w-64 bg-slate-200 flex-shrink-0"></div> {/* Skeleton da imagem */}
            <div className="p-5 ml-0 md:ml-5 flex-grow flex flex-col justify-between">
              <div>
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2.5"></div>
                <div className="h-7 bg-slate-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
              </div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Estado de Erro:
  // Se houver uma mensagem de erro no estado, exibe-a.
  if (error) {
    return (
      <div className="text-center py-12 px-4 bg-red-50 border border-red-200 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-red-800">Ocorreu um erro</h3>
        <p className="mt-1 text-sm text-red-700">{error}</p>
        <p className="mt-3 text-sm text-red-600">Por favor, tente novamente mais tarde ou verifique sua conexão.</p>
      </div>
    );
  }

  // 3. Nenhum Resultado:
  // Se a paginação não existir ou o total de quartos for zero (após o carregamento e sem erros),
  // exibe uma mensagem indicando que nenhum quarto foi encontrado.
  if (!pagination || pagination.totalRooms === 0) {
    return (
      <div className="text-center py-12 px-4 bg-slate-50 border border-slate-200 rounded-lg">
         <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 10h.01" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-slate-800">Nenhum Quarto Encontrado</h3>
        <p className="mt-1 text-sm text-slate-600">Tente ajustar seus filtros ou pesquisar por outros termos.</p>
      </div>
    );
  }

  // 4. Exibição da Lista:
  // Se houver quartos para exibir (sem loading, sem erro, e com resultados),
  // mapeia o array de quartos e renderiza um RoomCard para cada um.
  return (
    <div className="flex flex-col gap-6"> {/* Alterado de grid para flex flex-col */}
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  );
};

export default RoomList; 