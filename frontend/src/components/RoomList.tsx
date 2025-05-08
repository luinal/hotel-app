'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useFilterStore, Room } from '@/store/filters';
import RoomDetailPanel from './RoomDetailPanel';
import Image from 'next/image';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Button, 
  Chip, 
  Stack, 
  Divider,
  Paper,
  Skeleton,
  Grid,
  Alert,
  AlertTitle,
  IconButton
} from '@mui/material';
import { FavoriteBorder, Favorite } from '@mui/icons-material';
import { useAuthStore } from '@/store/auth';

// Componente para renderizar um único card de quarto.
// Recebe as informações do quarto via props.
const RoomCard: React.FC<{ 
  room: Room; 
  onClick: (room: Room) => void; 
}> = ({ room, onClick }) => {
  const { orderBy } = useFilterStore();
  const { isAuthenticated, toggleFavorite, isFavorite } = useAuthStore();
  
  const isFavorited = isFavorite(room.id);
  
  // Adiciona destaque ao campo que está sendo usado para ordenação
  const getHighlightStyle = (field: string) => {
    return orderBy === field ? { fontWeight: 700, color: 'primary.main' } : {};
  };
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    if (isAuthenticated) {
      toggleFavorite(room.id);
    }
  };
  
  return (
    <Card 
      sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-4px)'
        }
      }}
      onClick={() => onClick(room)}
    >
      {/* Imagem do Quarto */}
      <Box 
        sx={{ 
          position: 'relative',
          width: { xs: '100%', sm: '12rem', md: '16rem' },
          height: { xs: '12rem', sm: '10rem', md: '12rem' },
          backgroundColor: 'grey.100',
          flexShrink: 0
        }}
      >
        {room.imageUrl ? (
          <Image 
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${room.imageUrl}`}
            alt={`Imagem do quarto ${room.name}`}
            style={{ objectFit: 'cover' }}
            fill
            unoptimized={true}
          />
        ) : (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: 'text.disabled'
            }}
          >
            <Typography variant="body2">Sem imagem</Typography>
          </Box>
        )}
        
        {/* Botão de favorito sobreposto à imagem */}
        {isAuthenticated && (
          <IconButton
            onClick={handleFavoriteClick}
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              boxShadow: 1,
              '&:hover': { 
                backgroundColor: 'rgba(255, 255, 255, 1)',
              }
            }}
          >
            {isFavorited ? 
              <Favorite color="primary" /> : 
              <FavoriteBorder />
            }
          </IconButton>
        )}
        
        {/* Botão "Ver detalhes" sobreposto à imagem apenas em mobile */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 12, 
            right: 12, 
            display: { xs: 'block', sm: 'none' } 
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            size="medium"
            sx={{ 
              paddingX: 3, 
              paddingY: 1, 
              fontWeight: 600, 
              fontSize: '0.875rem' 
            }}
          >
            Ver detalhes
          </Button>
        </Box>
      </Box>

      {/* Conteúdo Textual */}
      <CardContent sx={{ 
        flexGrow: 1, 
        position: 'relative', 
        p: 2.5, 
        height: { xs: 'auto', sm: '10rem', md: '12rem' },
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Botão "Ver detalhes" no canto superior direito - apenas em desktop */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            display: { xs: 'none', sm: 'block' } 
          }}
        >
          <Button 
            variant="outlined" 
            color="primary" 
            size="medium"
            sx={{ 
              paddingX: 2, 
              paddingY: 0.75, 
              fontSize: '0.825rem',
              fontWeight: 500
            }}
          >
            Ver detalhes
          </Button>
        </Box>
        
        <Typography 
          variant="h6" 
          component="h3" 
          title={room.name}
          sx={{ 
            mb: 0.5, 
            transition: 'color 0.2s',
            '&:hover': { color: 'primary.main' },
            ...getHighlightStyle('name')
          }}
        >
          {room.name}
        </Typography>
        
        <Typography 
          variant="h6" 
          component="p" 
          sx={{ 
            mb: 0.5, 
            fontWeight: 700, 
            color: 'primary.main',
            ...getHighlightStyle('price')
          }}
        >
          R$ {room.price.toFixed(2).replace('.',',')}
          <Typography 
            component="span" 
            variant="body2" 
            sx={{ 
              ml: 0.5, 
              fontWeight: 400, 
              color: 'text.secondary' 
            }}
          >
            / noite
          </Typography>
        </Typography>
        
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 1.5, 
            color: 'text.secondary',
            ...getHighlightStyle('capacity'),
            marginTop: 0.5, 
          }}
        >
          Capacidade: {room.capacity} pessoa{room.capacity > 1 ? 's' : ''}
        </Typography>
        
        {room.features.length > 0 && (
          <Box sx={{ 
            mt: 1.5, 
            display: { xs: 'block', sm: 'block' }, 
            marginTop: 0,
          }}>
            <Typography 
              variant="caption" 
              component="h4" 
              sx={{ 
                mb: 1, 
                fontWeight: 500, 
                color: 'text.secondary' 
              }}
            >
              Comodidades:
            </Typography>
            
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {room.features.slice(0, 3).map((feature, index) => (
                <Chip 
                  key={index} 
                  label={feature} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'grey.100', 
                    color: 'text.secondary',
                    fontSize: '0.675rem',
                    height: '1.5rem'
                  }}
                />
              ))}
              {room.features.length > 3 && (
                <Chip 
                  label={`+${room.features.length - 3} mais`} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'grey.100', 
                    color: 'text.secondary',
                    fontSize: '0.675rem',
                    height: '1.5rem'
                  }}
                />
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
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
    <Stack spacing={3}>
      {[...Array(3)].map((_, i) => (
        <Card 
          key={i} 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            borderRadius: 3,
            overflow: 'hidden'
          }}
        >
          <Skeleton 
            variant="rectangular" 
            sx={{ 
              width: { xs: '100%', sm: '12rem', md: '16rem' },
              height: { xs: '12rem', sm: '10rem', md: '12rem' }
            }}
          />
          <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
            <Skeleton variant="text" width="75%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="33%" height={24} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="100%" height={40} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

// Componente principal que exibe a lista de quartos ou mensagens de status.
const RoomList: React.FC = () => {
  // Obtém o estado relevante da store Zustand: lista de quartos, status de loading, erro e informações de paginação.
  const { rooms, isLoading, error, pagination, orderBy, orderDirection, favoriteOnly } = useFilterStore();
  const { favorites, isAuthenticated } = useAuthStore();
  
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
  
  // Memoriza a lista ordenada e filtrada para evitar re-ordenação a cada renderização
  const sortedAndFilteredRooms = useMemo(() => {
    let filteredRooms = [...rooms];
    
    // Apply favorites filter if enabled
    if (favoriteOnly && isAuthenticated) {
      filteredRooms = filteredRooms.filter(room => favorites.includes(room.id));
    }
    
    // Apply sorting
    return sortRooms(filteredRooms, orderBy, orderDirection);
  }, [rooms, orderBy, orderDirection, favoriteOnly, favorites, isAuthenticated]);

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
      <Alert 
        severity="error" 
        variant="outlined"
        sx={{ 
          py: 6, 
          px: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          borderRadius: 2
        }}
      >
        <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 500 }}>Ocorreu um erro</AlertTitle>
        <Typography variant="body2" sx={{ mt: 1 }}>{error}</Typography>
        <Typography variant="body2" sx={{ mt: 2, color: 'error.dark' }}>
          Por favor, tente novamente mais tarde ou verifique sua conexão.
        </Typography>
      </Alert>
    );
  }

  // 3. Nenhum Resultado:
  // Se o total de quartos for zero (após o carregamento completo e sem erros),
  // exibe uma mensagem indicando que nenhum quarto foi encontrado.
  if (pagination.totalRooms === 0 || (favoriteOnly && sortedAndFilteredRooms.length === 0)) {
    return (
      <Alert 
        severity="info" 
        variant="outlined"
        sx={{ 
          py: 6, 
          px: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'grey.50'
        }}
      >
        <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
          {favoriteOnly ? 'Nenhum Favorito Encontrado' : 'Nenhum Quarto Encontrado'}
        </AlertTitle>
        <Typography variant="body2" sx={{ mt: 1 }}>
          {favoriteOnly 
            ? 'Você ainda não adicionou nenhum quarto aos favoritos.' 
            : 'Tente ajustar seus filtros ou pesquisar por outros termos.'}
        </Typography>
      </Alert>
    );
  }

  // 4. Exibição da Lista:
  return (
    <>
      <Stack spacing={3}>
        {sortedAndFilteredRooms.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room} 
            onClick={handleRoomClick}
          />
        ))}
      </Stack>
      
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