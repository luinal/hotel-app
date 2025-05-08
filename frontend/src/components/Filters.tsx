'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFilterStore, availableFeatures, FilterState } from '@/store/filters';
import { useAuthStore } from '@/store/auth';
import { useDebouncedCallback } from 'use-debounce';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Checkbox, 
  FormControlLabel, 
  Paper,
  Divider
} from '@mui/material';
import { Favorite } from '@mui/icons-material';

// Componente que renderiza a seção de filtros da aplicação.
const Filters: React.FC = () => {
  // Obtém o estado atual dos filtros e as ações para modificá-los da store Zustand.
  const {
    name: storeName, 
    priceMin: storePriceMin,
    priceMax: storePriceMax,
    capacity, features,
    favoriteOnly: storeFavoriteOnly,
    setFilters, clearFilters,
    setRoomsLoadingError,
    isLoading,
    setFavoriteOnly
  } = useFilterStore();
  
  const { isAuthenticated, favorites } = useAuthStore();

  // --- Estado Local para Inputs ---
  // Inicializa o estado local apenas uma vez e depois o mantém independente
  const [localName, setLocalName] = useState(storeName || '');
  const [localPriceMin, setLocalPriceMin] = useState(storePriceMin || '');
  const [localPriceMax, setLocalPriceMax] = useState(storePriceMax || '');
  const [localCapacity, setLocalCapacity] = useState(capacity || '');
  const [localFeatures, setLocalFeatures] = useState<FilterState['features']>({...features});
  const [localFavoriteOnly, setLocalFavoriteOnly] = useState(storeFavoriteOnly);
  
  // Determina se algum filtro está ativo usando os estados locais para inputs controlados localmente
  const isAnyFilterActive = 
    localName !== '' || 
    localPriceMin !== '' || 
    localPriceMax !== '' || 
    localCapacity !== '' || 
    Object.values(localFeatures).some(isActive => isActive) ||
    localFavoriteOnly;
    
  // Controla se a store deve atualizar o input (apenas na inicialização ou no clearFilters)
  const shouldSyncFromStore = useRef(true);
  
  // Função para formatar valor como moeda brasileira (sem o R$)
  const formatCurrency = (value: string): string => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Se não houver valor, retorna string vazia
    if (numericValue === '') return '';
    
    // Converte para número e divide por 100 para obter valor com decimais
    const floatValue = parseInt(numericValue, 10) / 100;
    
    // Formata o número com separadores brasileiros
    return floatValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // Função para converter valor formatado para o formato da API
  const parseCurrency = (formattedValue: string): string => {
    // Remove pontos e substitui vírgula por ponto para ter o formato que a API espera
    if (!formattedValue) return '';
    return formattedValue.replace(/\./g, '').replace(',', '.');
  };

  // Sincroniza o estado local sempre que a store muda por razões externas (como clearFilters)
  useEffect(() => {
    // Sempre sincronize quando os filtros foram limpos (todos os valores da store estão vazios)
    const isStoreEmpty = 
      storeName === '' && 
      storePriceMin === '' && 
      storePriceMax === '' && 
      capacity === '' && 
      Object.values(features).every(val => val === false);
    
    if (shouldSyncFromStore.current || isStoreEmpty) {
      setLocalName(storeName || '');
      // Formata os valores de preço ao recuperar da store
      setLocalPriceMin(storePriceMin ? formatCurrency(storePriceMin.replace('.', '').padEnd(storePriceMin.includes('.') ? 3 : 1, '0')) : '');
      setLocalPriceMax(storePriceMax ? formatCurrency(storePriceMax.replace('.', '').padEnd(storePriceMax.includes('.') ? 3 : 1, '0')) : '');
      setLocalCapacity(capacity || '');
      setLocalFeatures({...features});
      setLocalFavoriteOnly(storeFavoriteOnly);
      shouldSyncFromStore.current = false;
    }
  }, [storeName, storePriceMin, storePriceMax, capacity, features, storeFavoriteOnly]);

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
    setLocalFavoriteOnly(false);
    
    // Reativa a sincronização para garantir que os estados locais 
    // sejam atualizados após o clearFilters
    shouldSyncFromStore.current = true;
    
    // Depois limpa os filtros na store para atualização do estado global
    clearFilters();
    
    // Explicitly set favoriteOnly to false
    setFavoriteOnly(false);
  };

  // Handle favorite filter toggle
  const handleFavoriteToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setLocalFavoriteOnly(newValue);
    
    // Activate loading
    setRoomsLoadingError([], null, true, null);
    
    // Update store
    setFavoriteOnly(newValue);
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

  // Handler para inputs de preço com debounce e formatação
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = e.target;
    
    // Formata o valor inserido
    const formattedValue = formatCurrency(value);
    
    // Atualiza o estado local correspondente com o valor formatado
    if (inputName === 'priceMin') {
      setLocalPriceMin(formattedValue);
    } else if (inputName === 'priceMax') {
      setLocalPriceMax(formattedValue);
    }
    
    // Mostra o skeleton de carregamento imediatamente
    setRoomsLoadingError([], null, true, null);
    
    // Atualiza a store com debounce usando o valor numérico para a API
    debouncedUpdateStore(inputName, parseCurrency(formattedValue));
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

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="text.primary">Filtros</Typography>
        <Button 
          onClick={handleClearFilters}
          disabled={!isAnyFilterActive || isLoading}
          color="primary"
          size="small"
          sx={{ 
            opacity: (!isAnyFilterActive || isLoading) ? 0.5 : 1,
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Limpar Filtros
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Input: Nome do Quarto */}
        <Box>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Nome do Quarto"
            value={localName}
            onChange={handleNameInputChange}
            placeholder="Ex: Suíte Luxo"
            size="small"
            variant="outlined"
          />
        </Box>

        {/* Inputs: Faixa de Preço */}
        <Box>
          <Typography fontWeight={400} variant="body2" color="text.primary" sx={{ mb: 1 }}>
            Faixa de Preço
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                id="priceMin"
                name="priceMin"
                value={localPriceMin}
                onChange={handlePriceInputChange}
                placeholder="Mín R$"
                size="small"
                variant="outlined"
                inputProps={{ style: { textAlign: 'center' } }}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                id="priceMax"
                name="priceMax"
                value={localPriceMax}
                onChange={handlePriceInputChange}
                placeholder="Máx R$"
                size="small"
                variant="outlined"
                inputProps={{ style: { textAlign: 'center' } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Select: Capacidade */}
        <Box>
          <FormControl fullWidth size="small">
            <InputLabel id="capacity-label">Capacidade (Pessoas)</InputLabel>
            <Select
              labelId="capacity-label"
              id="capacity"
              name="capacity"
              value={localCapacity}
              label="Capacidade (Pessoas)"
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'capacity',
                    value: e.target.value
                  }
                } as React.ChangeEvent<HTMLSelectElement>;
                handleSelectChange(event);
              }}
            >
              <MenuItem value="">Qualquer</MenuItem>
              <MenuItem value="1">1 Pessoa</MenuItem>
              <MenuItem value="2">2 Pessoas</MenuItem>
              <MenuItem value="3">3 Pessoas</MenuItem>
              <MenuItem value="4">4 Pessoas</MenuItem>
              <MenuItem value="5">5 Pessoas</MenuItem>
              <MenuItem value="6+">6+ Pessoas</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Favorite Filter - Only visible when authenticated */}
        {isAuthenticated && (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFavoriteOnly}
                  onChange={handleFavoriteToggle}
                  icon={<Favorite />}
                  checkedIcon={<Favorite />}
                  color="primary"
                  sx={{ p: 1, cursor: 'pointer' }}
                />
              }
              sx={{ my: -1.5, cursor: 'default' }}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" fontWeight={500} sx={{ cursor: 'pointer' }}>
                    Favoritos
                  </Typography>
                  {favorites.length > 0 && !localFavoriteOnly && (
                    <Typography variant="caption" sx={{ ml: 1, bgcolor: 'primary.main', color: 'white', px: 1, py: 0.5, borderRadius: 1 }}>
                      {favorites.length}
                    </Typography>
                  )}
                </Box>
              }
            />
            <Divider />
          </>
        )}

        {/* Checkboxes: Características */}
        <Box>
          <Typography fontWeight={400} variant="body2" color="text.primary" sx={{ mb: 1 }}>
            Características
          </Typography>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.25 }}>
            {Object.entries(availableFeatures).map(([key, label]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={localFeatures[key] || false}
                    onChange={handleCheckboxChange}
                    name={key}
                    size="small"
                    color="primary"
                  />
                }
                label={<Typography variant="body2">{label}</Typography>}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default Filters; 