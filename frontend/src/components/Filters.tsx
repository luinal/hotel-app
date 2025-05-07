'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFilterStore, availableFeatures, FilterState } from '@/store/filters';
import { useDebouncedCallback } from 'use-debounce';

// Componente que renderiza a seção de filtros da aplicação.
const Filters: React.FC = () => {
  // Obtém o estado atual dos filtros e as ações para modificá-los da store Zustand.
  const {
    name: storeName, 
    priceMin: storePriceMin,
    priceMax: storePriceMax,
    capacity, features,
    setFilters, clearFilters,
    setRoomsLoadingError
  } = useFilterStore();

  // --- Estado Local para Inputs ---
  // Inicializa o estado local apenas uma vez e depois o mantém independente
  const [localName, setLocalName] = useState(storeName || '');
  const [localPriceMin, setLocalPriceMin] = useState(storePriceMin || '');
  const [localPriceMax, setLocalPriceMax] = useState(storePriceMax || '');
  const [localCapacity, setLocalCapacity] = useState(capacity || '');
  const [localFeatures, setLocalFeatures] = useState<FilterState['features']>({...features});
  
  // Determina se algum filtro está ativo usando os estados locais para inputs controlados localmente
  const isAnyFilterActive = 
    localName !== '' || 
    localPriceMin !== '' || 
    localPriceMax !== '' || 
    localCapacity !== '' || 
    Object.values(localFeatures).some(isActive => isActive);
    
  // Controla se a store deve atualizar o input (apenas na inicialização ou no clearFilters)
  const shouldSyncFromStore = useRef(true);
  
  // Sincroniza o estado local apenas quando a store muda por razões externas (como clearFilters)
  useEffect(() => {
    if (shouldSyncFromStore.current) {
      setLocalName(storeName || '');
      setLocalPriceMin(storePriceMin || '');
      setLocalPriceMax(storePriceMax || '');
      setLocalCapacity(capacity || '');
      setLocalFeatures({...features});
      shouldSyncFromStore.current = false;
    }
  }, [storeName, storePriceMin, storePriceMax, capacity, features]);

  // Re-habilita a sincronização quando os filtros são limpos
  const handleClearFilters = () => {
    // Primeiro limpa os estados locais para atualização imediata da UI
    setLocalName('');
    setLocalPriceMin('');
    setLocalPriceMax('');
    setLocalCapacity('');
    setLocalFeatures(Object.keys(availableFeatures).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {} as FilterState['features']));
    
    // Depois limpa os filtros na store para atualização do estado global
    clearFilters();
    
    // Ativa o skeleton de carregamento para indicar que os dados estão sendo recarregados
    setRoomsLoadingError([], null, true, null);
  };

  // --- Lógica de Debounce para Atualizar a Store Zustand ---
  const debouncedUpdateStore = useDebouncedCallback((field: string, value: string) => {
    setFilters({ [field]: value });
  }, 700);

  // Handler para o input de nome
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalName(newValue);
    
    // Imediatamente configura o estado para loading quando o usuário digita
    // Isso garante que o skeleton seja exibido entre digitações
    setRoomsLoadingError([], null, true, null);
    
    // Sempre chama o debounce, mesmo com string vazia
    debouncedUpdateStore('name', newValue);
  };

  // Handler para inputs de preço com debounce
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = e.target;
    
    // Verifica se o input é um número válido
    if (value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return; // Impede a entrada de valores não numéricos
    }
    
    // Atualiza o estado local correspondente
    if (inputName === 'priceMin') {
      setLocalPriceMin(value);
    } else if (inputName === 'priceMax') {
      setLocalPriceMax(value);
    }
    
    // Mostra o skeleton de carregamento imediatamente
    setRoomsLoadingError([], null, true, null);
    
    // Atualiza a store com debounce
    debouncedUpdateStore(inputName, value);
  };

  // Handler para os checkboxes de features com estado local.
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, checked } = e.target;
    
    // Atualiza o estado local primeiro para resposta imediata da UI
    const newFeatures = { ...localFeatures, [inputName]: checked };
    setLocalFeatures(newFeatures);
    
    // Ativa o skeleton de carregamento
    setRoomsLoadingError([], null, true, null);
    
    // Atualiza a store Zustand
    setFilters({ features: newFeatures });
  };

  // Handler para o select de capacidade com estado local.
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name: inputName, value } = e.target;
    
    // Atualiza o estado local para resposta imediata da UI
    setLocalCapacity(value);
    
    // Ativa o skeleton de carregamento
    setRoomsLoadingError([], null, true, null);
    
    // Chama setFilters para o select.
    setFilters({ [inputName]: value });
  };

  const inputBaseClass = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelBaseClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Filtros</h2>
        <button
          onClick={handleClearFilters}
          disabled={!isAnyFilterActive}
          aria-disabled={!isAnyFilterActive}
          className={`text-sm font-medium transition-colors ${
            isAnyFilterActive 
              ? 'text-indigo-600 hover:text-indigo-500 cursor-pointer' 
              : 'text-slate-400 opacity-50 cursor-not-allowed'
          }`}
        >
          Limpar Filtros
        </button>
      </div>

      <div className="space-y-6">
        {/* Input: Nome do Quarto */}
        <div>
          <label htmlFor="name" className={labelBaseClass}>Nome do Quarto</label>
          <input
            type="text"
            id="name"
            name="name"
            value={localName}
            onChange={handleNameInputChange}
            placeholder="Ex: Suíte Luxo"
            className={inputBaseClass}
          />
        </div>

        {/* Inputs: Faixa de Preço */}
        <div>
          <label className={labelBaseClass}>Faixa de Preço</label>
          <div className="mt-1 grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                id="priceMin"
                name="priceMin"
                value={localPriceMin}
                onChange={handlePriceInputChange}
                placeholder="Mín R$"
                pattern="[0-9]*\.?[0-9]*"
                className={`${inputBaseClass} text-center`}
              />
            </div>
            <div>
              <input
                type="text"
                id="priceMax"
                name="priceMax"
                value={localPriceMax}
                onChange={handlePriceInputChange}
                placeholder="Máx R$"
                pattern="[0-9]*\.?[0-9]*"
                className={`${inputBaseClass} text-center`}
              />
            </div>
          </div>
        </div>

        {/* Select: Capacidade */}
        <div>
          <label htmlFor="capacity" className={labelBaseClass}>Capacidade (Pessoas)</label>
          <select
            id="capacity"
            name="capacity"
            value={localCapacity}
            onChange={handleSelectChange}
            className={inputBaseClass}
          >
            <option value="">Qualquer</option>
            <option value="1">1 Pessoa</option>
            <option value="2">2 Pessoas</option>
            <option value="3">3 Pessoas</option>
            <option value="4">4 Pessoas</option>
            <option value="5">5 Pessoas</option>
            <option value="6">6 Pessoas</option>
            <option value="7">6+ Pessoas</option>
          </select>
        </div>

        {/* Checkboxes: Características */}
        <div>
          <label className={`${labelBaseClass} mb-1`}>Características</label>
          <div className="mt-2 space-y-3">
            {Object.entries(availableFeatures).map(([key, label]) => (
              <label key={key} htmlFor={`feature-${key}`} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  id={`feature-${key}`}
                  name={key}
                  type="checkbox"
                  checked={localFeatures[key as keyof FilterState['features']] || false}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded group-hover:border-indigo-400 transition-colors"
                />
                <span className="text-sm text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters; 