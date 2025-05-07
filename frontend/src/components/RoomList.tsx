'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useFilterStore, Room } from '@/store/filters';
import RoomDetailPanel from './RoomDetailPanel';

// Componente para renderizar um único card de quarto.
// Recebe as informações do quarto via props.
const RoomCard: React.FC<{ 
  room: Room; 
  onClick: (room: Room) => void; 
}> = ({ room, onClick }) => {
  const { orderBy } = useFilterStore();
  
  // Adiciona destaque ao campo que está sendo usado para ordenação
  const getHighlightClass = (field: string) => {
    return orderBy === field ? "font-bold text-indigo-700" : "";
  };
  
  return (
    <div 
      className="flex bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 group overflow-hidden cursor-pointer"
      onClick={() => onClick(room)}
    >
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
      <div className="p-5 flex-grow min-w-0 relative"> 
        {/* Botão "Ver detalhes" no canto superior direito */}
        <div className="absolute top-3 right-3">
          <button className="px-2 py-1 text-xs font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors">
            Ver detalhes
          </button>
        </div>
        
        <h3 className={`text-lg font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors mb-1.5 truncate ${getHighlightClass('name')}`}
            title={room.name} // Adiciona tooltip para nomes longos
        >
          {room.name}
        </h3>
        <p className={`text-xl font-bold text-indigo-600 mb-2 ${getHighlightClass('price')}`}>
          R$ {room.price.toFixed(2).replace('.',',')}
          <span className="text-sm font-normal text-slate-500"> / noite</span>
        </p>
        <p className={`text-sm text-slate-600 mb-3 ${getHighlightClass('capacity')}`}>
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
};

// Função auxiliar para ordenar os quartos
const sortRooms = (rooms: Room[], orderBy: string, orderDirection: 'asc' | 'desc'): Room[] => {
  if (!orderBy) return rooms; // Se não houver campo de ordenação, retorna a lista original
  
  return [...rooms].sort((a, b) => {
    let valueA, valueB;
    
    // Determina os valores a comparar com base no campo de ordenação
    switch (orderBy) {
      case 'name':
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
        break;
      case 'price':
        valueA = a.price;
        valueB = b.price;
        break;
      case 'capacity':
        valueA = a.capacity;
        valueB = b.capacity;
        break;
      default:
        return 0; // Sem ordenação
    }
    
    // Compara os valores na direção especificada
    if (orderDirection === 'asc') {
      return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    } else {
      return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
    }
  });
};

// Componente de Skeleton para carregamento
const RoomSkeleton = () => {
  return (
    <div className="flex flex-col gap-6">
      {[...Array(3)].map((_, i) => ( // 3 Skeletons
        <div key={i} className="flex bg-white border border-slate-200 rounded-xl shadow-sm animate-pulse overflow-hidden h-40 md:h-48">
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
};

// Componente principal que exibe a lista de quartos ou mensagens de status.
const RoomList: React.FC = () => {
  // Obtém o estado relevante da store Zustand: lista de quartos, status de loading, erro e informações de paginação.
  const { rooms, isLoading, error, pagination, orderBy, orderDirection } = useFilterStore();
  
  // Estado para controlar qual quarto está selecionado e se o painel de detalhes está aberto
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isPanelInitialized, setIsPanelInitialized] = useState(false);
  
  // Inicializar o primeiro quarto disponível para o drawer, mantendo-o fechado
  useEffect(() => {
    if (!isPanelInitialized && !isLoading && rooms.length > 0) {
      // Apenas inicializa com um quarto, mas não abre o painel
      setSelectedRoom(rooms[0]);
      setIsPanelInitialized(true);
    }
  }, [isLoading, rooms, isPanelInitialized]);
  
  // Memoriza a lista ordenada para evitar re-ordenação a cada renderização
  const sortedRooms = useMemo(() => {
    return sortRooms(rooms, orderBy, orderDirection);
  }, [rooms, orderBy, orderDirection]);

  // Abre o painel de detalhes com o quarto selecionado
  const handleRoomClick = (room: Room) => {
    setSelectedRoom(room);
    setIsPanelOpen(true);
  };
  
  // Fecha o painel de detalhes
  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  // --- Renderização Condicional --- //

  // 1. Estado de Carregamento:
  // Mostrar skeleton se (a) está carregando ou (b) ainda não temos pagination (carregamento inicial)
  if (isLoading || pagination === null) {
    return <RoomSkeleton />;
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
  // Se o total de quartos for zero (após o carregamento completo e sem erros),
  // exibe uma mensagem indicando que nenhum quarto foi encontrado.
  if (pagination.totalRooms === 0) {
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
  return (
    <>
      <div className="flex flex-col gap-6">
        {sortedRooms.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={handleRoomClick}
          />
        ))}
      </div>
      
      {/* O drawer está sempre presente, mas só abre quando isPanelOpen é true */}
      <RoomDetailPanel 
        room={selectedRoom}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </>
  );
};

export default RoomList; 