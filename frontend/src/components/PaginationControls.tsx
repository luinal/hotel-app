'use client';

import React from 'react';
import { useFilterStore } from '@/store/filters';
import { 
  Pagination, 
  PaginationItem, 
  Box, 
  Button, 
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Componente para renderizar os controles da paginação.
const PaginationControls: React.FC = () => {
  // Obtém informações de paginação, a ação setPage e o status de loading da store.
  const { pagination, setPage, isLoading } = useFilterStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Condição para não renderizar os controles:
  // 1. Durante o carregamento (isLoading).
  // 2. Se não houver dados de paginação (!pagination).
  // 3. Se houver apenas uma página ou menos (totalPages <= 1).
  if (isLoading || !pagination || pagination.totalPages <= 1) {
    return null;
  }

  // Desestrutura as informações relevantes da paginação.
  const { currentPage, totalPages } = pagination;

  // Handler para mudança de página
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setPage(page);
  };

  // Para dispositivos móveis, mostrar apenas botões de anterior/próximo com indicador
  if (isMobile) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Button
          onClick={() => currentPage > 1 && setPage(currentPage - 1)}
          disabled={currentPage <= 1}
          startIcon={<ArrowBackIcon />}
          size="small"
          sx={{
            color: currentPage <= 1 ? 'text.disabled' : 'text.primary',
          }}
        >
          Anterior
        </Button>
        
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {totalPages}
        </Typography>
        
        <Button
          onClick={() => currentPage < totalPages && setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          endIcon={<ArrowForwardIcon />}
          size="small"
          sx={{
            color: currentPage >= totalPages ? 'text.disabled' : 'text.primary',
          }}
        >
          Próxima
        </Button>
      </Box>
    );
  }

  // Para desktop, mostrar o componente de paginação completo
  return (
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={handlePageChange}
      color="primary"
      shape="rounded"
      renderItem={(item) => (
        <PaginationItem
          {...item}
          sx={{
            '&.Mui-selected': {
              bgcolor: 'primary.main',
              borderColor: 'primary.main',
              color: 'white',
            }
          }}
        />
      )}
    />
  );
};

export default PaginationControls; 