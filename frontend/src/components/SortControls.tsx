'use client';

import { useFilterStore, OrderBy, OrderDirection } from '@/store/filters';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography, Stack } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';

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
  const handleOrderChange = (e: SelectChangeEvent<string>) => {
    const newOrderBy = e.target.value as OrderBy;
    setOrder(newOrderBy, orderDirection);
  };

  // Handler para mudanças no select de direção
  const handleDirectionChange = (e: SelectChangeEvent<string>) => {
    const newDirection = e.target.value as OrderDirection;
    setOrder(orderBy, newDirection);
  };

  return (
    <Box>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        alignItems={{ xs: 'flex-start', sm: 'center' }}
      >
        <Typography
          variant="body2"
          sx={{ 
            fontWeight: 500, 
            color: 'text.secondary'
          }}
        >
          Ordenar por:
        </Typography>
        
        <Box display="flex" gap={2}>
          {/* Select para o campo de ordenação */}
          <FormControl size="small" sx={{ width: 120 }}>
            <Select
              value={orderBy}
              onChange={handleOrderChange}
              displayEmpty
              disabled={isLoading}
            >
              {orderByOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Select para a direção da ordenação */}
          <FormControl size="small" sx={{ width: 150 }}>
            <Select
              value={orderDirection}
              onChange={handleDirectionChange}
              disabled={isLoading || !orderBy}
            >
              {orderDirections.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </Box>
  );
};

export default SortControls; 