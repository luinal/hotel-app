'use client';

import React from 'react';
import { useFilterStore } from '@/store/filters';

// Componente para renderizar os botões de controle da paginação (Anterior/Próxima).
const PaginationControls: React.FC = () => {
  // Obtém informações de paginação, a ação setPage e o status de loading da store.
  const { pagination, setPage, isLoading } = useFilterStore();

  // Condição para não renderizar os controles:
  // 1. Durante o carregamento (isLoading).
  // 2. Se não houver dados de paginação (!pagination).
  // 3. Se houver apenas uma página ou menos (totalPages <= 1).
  if (isLoading || !pagination || pagination.totalPages <= 1) {
    return null;
  }

  // Desestrutura as informações relevantes da paginação.
  const { currentPage, totalPages } = pagination;

  // Handler para o botão "Anterior".
  // Chama setPage com a página anterior apenas se não estiver na primeira página.
  const handlePrevious = () => {
    if (currentPage > 1) {
      setPage(currentPage - 1); // Atualiza o estado Zustand, o que disparará nova busca de dados.
    }
  };

  // Handler para o botão "Próxima".
  // Chama setPage com a próxima página apenas se não estiver na última página.
  const handleNext = () => {
    if (currentPage < totalPages) {
      setPage(currentPage + 1); // Atualiza o estado Zustand.
    }
  };

  const buttonBaseStyle = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out";
  const enabledStyle = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";
  const disabledStyle = "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed";
  const activePageStyle = "bg-indigo-50 border-indigo-500 text-indigo-600 z-10";
  const defaultPageStyle = "bg-white border-slate-300 text-slate-500 hover:bg-slate-50";

  const PageButton: React.FC<{ page: number; isActive: boolean }> = ({ page, isActive }) => (
    <button
      onClick={() => setPage(page)}
      className={`${buttonBaseStyle} ${isActive ? activePageStyle : defaultPageStyle} w-10 h-10 p-0`}
      aria-current={isActive ? 'page' : undefined}
    >
      {page}
    </button>
  );

  // Lógica para gerar os botões de página (simplificado)
  const getPageButtons = () => {
    const buttons = [];
    const maxPagesToShow = 5; // Máximo de botões de página visíveis
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(<PageButton key={i} page={i} isActive={i === currentPage} />);
    }
    return buttons;
  };

  return (
    <nav className="flex items-center justify-between sm:justify-center space-x-1" aria-label="Pagination">
      <button
        onClick={handlePrevious}
        disabled={currentPage <= 1}
        className={`${buttonBaseStyle} ${currentPage <= 1 ? disabledStyle : enabledStyle}`}
      >
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
        </svg>
        <span className="sr-only sm:not-sr-only sm:ml-2">Anterior</span>
      </button>

      <div className="hidden sm:flex space-x-1">
        {getPageButtons()}
      </div>

      {/* Indicador de Página Atual / Total em telas pequenas */}
      <span className="sm:hidden text-sm text-slate-700">
        Página {currentPage} de {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages}
        className={`${buttonBaseStyle} ${currentPage >= totalPages ? disabledStyle : enabledStyle}`}
      >
        <span className="sr-only sm:not-sr-only sm:mr-2">Próxima</span>
        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
        </svg>
      </button>
    </nav>
  );
};

export default PaginationControls; 