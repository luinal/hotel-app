'use client';

import { useFilterStore, OrderBy, OrderDirection } from '@/store/filters';

// Define as opções de ordenação disponíveis com rótulos em português
const orderByOptions: { value: OrderBy; label: string }[] = [
  { value: '', label: 'Padrão' },
  { value: 'name', label: 'Nome' },
  { value: 'price', label: 'Preço' },
  { value: 'capacity', label: 'Capacidade' }
];

// Define as opções de direção de ordenação com rótulos em português
const orderDirections: { value: OrderDirection; label: string }[] = [
  { value: 'asc', label: 'Crescente' },
  { value: 'desc', label: 'Decrescente' }
];

const SortControls: React.FC = () => {
  // Obtém os valores e a função de ordenação do store
  const { orderBy, orderDirection, setOrder, isLoading } = useFilterStore();

  // Handler para mudanças no select de ordenação
  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newOrderBy = e.target.value as OrderBy;
    setOrder(newOrderBy, orderDirection);
  };

  // Handler para mudanças no select de direção
  const handleDirectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDirection = e.target.value as OrderDirection;
    setOrder(orderBy, newDirection);
  };

  // Classes base para os selects
  const selectBaseClass = "bg-white border border-slate-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm";
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
      <span className="text-sm font-medium text-slate-700">Ordenar por:</span>
      
      <div className="flex items-center space-x-3">
        {/* Select para o campo de ordenação */}
        <select
          value={orderBy}
          onChange={handleOrderChange}
          className={`${selectBaseClass} w-[120px]`}
          disabled={isLoading}
        >
          {orderByOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Select para a direção da ordenação */}
        <select
          value={orderDirection}
          onChange={handleDirectionChange}
          className={`${selectBaseClass} w-[120px]`}
          disabled={isLoading || !orderBy}
        >
          {orderDirections.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SortControls; 