'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Room } from '@/store/filters';
import Image from 'next/image';
import { Box, Typography, Button, IconButton, Paper, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckIcon from '@mui/icons-material/Check';

interface RoomDetailPanelProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ room, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRendered, setIsRendered] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Criar um array de imagens que inclui a imagem do quarto (se existir) e as imagens placeholder
  const roomImages = useMemo(() => {
    // Array de imagens de exemplo - normalmente viria do backend
    const images = [
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+2',
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+3',
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+4',
    ];
    
    if (room?.imageUrl) {
      return [
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}${room.imageUrl}`,
        ...images
      ];
    }
    return images;
  }, [room?.imageUrl]);

  // Resetar a imagem ativa quando mudar de quarto
  useEffect(() => {
    setActiveImageIndex(0);
  }, [room]);
  
  // Efeito para gerenciar a rolagem e inicializar a renderização
  useEffect(() => {
    // Garantir que o componente seja adequadamente renderizado antes de aplicar transições
    if (!isRendered) {
      setIsRendered(true);
    }
    
    // Função para verificar se o dispositivo é mobile
    const isMobile = () => window.innerWidth < 600;
    
    // Função para aplicar ou remover o bloqueio de rolagem
    const updateScrollLock = () => {
      if (isOpen) {
        if (isMobile()) {
          // Bloqueia rolagem em mobile
          document.body.style.overflow = 'hidden';
        } else {
          // Permite rolagem em desktop
          document.body.style.overflow = '';
        }
      }
    };
    
    // Aplicar configuração inicial
    updateScrollLock();
    
    // Adicionar listener para redimensionamentos
    window.addEventListener('resize', updateScrollLock);
    
    if (!isOpen) {
      // Restaura a rolagem da página
      document.body.style.overflow = '';
    }
    
    return () => {
      // Limpeza ao desmontar
      document.body.style.overflow = '';
      window.removeEventListener('resize', updateScrollLock);
    };
  }, [isOpen, isRendered]);
  
  // Gerenciar cliques fora do painel para fechá-lo
  useEffect(() => {
    const handleBackdropClick = (e: MouseEvent) => {
      if (backdropRef.current && e.target === backdropRef.current) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('click', handleBackdropClick);
    }
    
    return () => {
      document.removeEventListener('click', handleBackdropClick);
    };
  }, [isOpen, onClose]);
  
  // Se não houver quarto selecionado, não renderize nada
  if (!room) return null;

  // Ir para a próxima imagem no carrossel
  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % roomImages.length);
  };

  // Ir para a imagem anterior no carrossel
  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + roomImages.length) % roomImages.length);
  };
  
  // Funcionalidade adicional que poderia ser implementada
  const handleReserve = () => {
    alert(`Reserva realizada para o quarto: ${room.name}`);
    onClose();
  };
  
  return (
    <>
      {/* Overlay transparente que intercepta cliques */}
      <Box
        ref={backdropRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1300,
          visibility: isOpen ? 'visible' : 'hidden',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'visibility 0.5s ease'
        }}
      />
      
      {/* Painel deslizante */}
      <Box
        ref={panelRef}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: { xs: '100%', sm: '400px' },
          bgcolor: 'background.paper',
          boxShadow: '-4px 0 8px rgba(0, 0, 0, 0.1)',
          zIndex: 1400,
          overflow: 'auto',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: isRendered ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          willChange: 'transform',
        }}
      >
        {/* Botão de fechar */}
        <IconButton 
          onClick={onClose}
          sx={{ 
            position: 'absolute', 
            top: 12, 
            right: 12, 
            bgcolor: 'background.paper',
            boxShadow: 1,
            zIndex: 10,
            '&:hover': { bgcolor: 'grey.100' }
          }}
          aria-label="Fechar painel"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
        
        {/* Carrossel de imagens */}
        <Box sx={{ 
          position: 'relative', 
          height: 260, 
          bgcolor: 'grey.100', 
          overflow: 'hidden',
          mt: { xs: 4, sm: 4 }
        }}>
          {/* Container do carrossel com transição horizontal */}
          <Box sx={{ height: '100%', position: 'relative' }}>
            {roomImages.map((imageUrl, index) => (
              <Box 
                key={index} 
                sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%',
                  transition: 'transform 700ms ease-in-out',
                  transform: `translateX(${(index - activeImageIndex) * 100}%)`,
                  zIndex: index === activeImageIndex ? 1 : 0
                }}
              >
                <Image 
                  src={imageUrl} 
                  alt={`Imagem ${index + 1} do quarto ${room.name}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  width={600}
                  height={400}
                  unoptimized={true}
                />
              </Box>
            ))}
          </Box>
          
          {/* Controles do carrossel */}
          <IconButton 
            onClick={prevImage}
            sx={{ 
              position: 'absolute', 
              left: 8, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'background.paper', 
              '&:hover': { bgcolor: 'background.paper' },
              boxShadow: 1,
              zIndex: 10,
            }}
            aria-label="Imagem anterior"
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          
          <IconButton 
            onClick={nextImage}
            sx={{ 
              position: 'absolute', 
              right: 8, 
              top: '50%', 
              transform: 'translateY(-50%)', 
              bgcolor: 'background.paper', 
              '&:hover': { bgcolor: 'background.paper' },
              boxShadow: 1,
              zIndex: 10,
            }}
            aria-label="Próxima imagem"
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
          
          {/* Indicadores de imagem */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 0, 
            right: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 1,
            zIndex: 10,
          }}>
            {roomImages.map((_, idx) => (
              <Box 
                key={idx}
                component="button"
                onClick={() => setActiveImageIndex(idx)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: idx === activeImageIndex ? 'common.white' : 'rgba(255, 255, 255, 0.5)',
                  border: 'none',
                  p: 0,
                  cursor: 'pointer',
                  transition: 'background-color 0.3s'
                }}
                aria-label={`Ver imagem ${idx + 1}`}
              />
            ))}
          </Box>
        </Box>
        
        {/* Conteúdo principal */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
            {room.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={700} color="primary" sx={{ mr: 1 }}>
              R$ {room.price.toFixed(2).replace('.',',')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              por noite
            </Typography>
          </Box>
          
          {/* Detalhes do quarto */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
              Detalhes
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.primary">Capacidade:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {room.capacity} pessoa{room.capacity > 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.primary">Disponibilidade:</Typography>
                <Typography variant="body2" fontWeight={500} color="success.main">
                  Disponível
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.primary">Tamanho:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {30 + (room.capacity * 5)} m²
                </Typography>
              </Box>
            </Paper>
          </Box>
          
          {/* Comodidades */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
              Comodidades
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 1 
            }}>
              {room.features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckIcon fontSize="small" color="primary" />
                  <Typography variant="body2">{feature}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          
          {/* Descrição */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" sx={{ mb: 1 }}>
              Descrição
            </Typography>
            <Typography fontSize={16} variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
              {room.description ? room.description : `
                Desfrute de uma estadia confortável neste quarto espaçoso e elegante.
                Perfeito para ${room.capacity === 1 ? 'viajantes solo' : room.capacity <= 2 ? 'casais' : 'famílias'}, 
                este quarto oferece o equilíbrio perfeito entre conforto e estilo.
                Com decoração requintada e todas as comodidades modernas, garantimos uma 
                experiência memorável durante sua estadia.
              `}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Botão de reserva */}
          <Button 
            variant="contained" 
            color="primary" 
            fullWidth 
            size="large"
            onClick={handleReserve}
            sx={{ mt: 2 }}
          >
            Reservar agora
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default RoomDetailPanel; 