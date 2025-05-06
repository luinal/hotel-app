'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
    setFilters, clearFilters
  } = useFilterStore();

  // Determina se algum filtro está ativo
  const isAnyFilterActive = 
    storeName !== '' || 
    storePriceMin !== '' || 
    storePriceMax !== '' || 
    capacity !== '' || 
    Object.values(features).some(isActive => isActive);

  // --- Estado Local para Inputs com Debounce ---
  const [localName, setLocalName] = useState(storeName || '');

  useEffect(() => {
    // Evita atualizações desnecessárias do localName e interferências durante digitação
    if (storeName !== localName && (storeName !== undefined || localName !== '')) {
      setLocalName(storeName || '');
    }
  }, [storeName]); // Depender apenas de storeName para esta sincronização

  // --- Lógica de Debounce para Atualizar a Store Zustand ---
  // Função que realmente chama setFilters na store
  const updateStoreWithName = useCallback((newName: string) => {
    setFilters({ name: newName });
  }, [setFilters]);

  const debouncedUpdateStoreName = useDebouncedCallback(updateStoreWithName, 700);

  // useEffect para observar mudanças no localName e chamar a atualização debounced da store
  useEffect(() => {
    if (localName !== storeName) {
      debouncedUpdateStoreName(localName);
    }
    return () => {
      debouncedUpdateStoreName.cancel();
    };
  }, [localName, storeName, debouncedUpdateStoreName]);

  // Handler para o input de nome (atualiza estado local)
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalName(e.target.value);
  };

  // Handler para inputs de preço (atualiza a store diretamente por enquanto, SEM DEBOUNCE)
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = e.target;
    setFilters({ [inputName]: value });
  };

  // Handler para os checkboxes de features.
  // Atualiza o estado imediatamente (sem debounce) quando um checkbox é marcado/desmarcado.
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, checked } = e.target;
    // Chama setFilters diretamente, atualizando o objeto 'features' no estado.
    // Cria um novo objeto de features mesclando o estado atual com a feature alterada.
    setFilters({ features: { ...features, [inputName]: checked } });
  };

  // Handler para o select de capacidade.
  // Atualiza o estado imediatamente (sem debounce).
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name: inputName, value } = e.target;
    // Chama setFilters diretamente para o select.
    setFilters({ [inputName]: value });
  };

  const inputBaseClass = "mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
  const labelBaseClass = "block text-sm font-medium text-slate-700";

  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-800">Filtros</h2>
        <button
          onClick={clearFilters}
          disabled={!isAnyFilterActive} // Desabilita se nenhum filtro estiver ativo
          className={`text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors ${
            !isAnyFilterActive ? 'opacity-50 cursor-not-allowed' : ''
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
                type="number"
                id="priceMin"
                name="priceMin"
                value={storePriceMin || ''} // Usa valor da store diretamente
                onChange={handlePriceInputChange} // Handler sem debounce
                placeholder="Mín R$"
                min="0"
                className={`${inputBaseClass} text-center`}
              />
            </div>
            <div>
              <input
                type="number"
                id="priceMax"
                name="priceMax"
                value={storePriceMax || ''} // Usa valor da store diretamente
                onChange={handlePriceInputChange} // Handler sem debounce
                placeholder="Máx R$"
                min="0"
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
            value={capacity || ''}
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
                  checked={features[key as keyof FilterState['features']] || false} // Ajuste de tipo
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