'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Room } from '@/store/filters';
import Image from 'next/image';

interface RoomDetailPanelProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailPanel: React.FC<RoomDetailPanelProps> = ({ room, isOpen, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRendered, setIsRendered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Criar um array de imagens que inclui a imagem do quarto (se existir) e as imagens placeholder
  const roomImages = useMemo(() => {
    // Array de imagens de exemplo - normalmente viria do backend
    const images = [
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+1',
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+2',
      'https://placehold.co/600x400/e9ecef/6c757d?text=Quarto+Imagem+3',
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
  
  // Garantir que o componente seja adequadamente renderizado antes de aplicar transições
  useEffect(() => {
    if (!isRendered) {
      setIsRendered(true);
    }

    if (isOpen && panelRef.current) {
      // Força um reflow para garantir que o browser processe a mudança de posição
      panelRef.current.getBoundingClientRect();
    }
  }, [isOpen, isRendered]);
  
  // Prevenir a rolagem quando o painel está aberto
  useEffect(() => {
    if (isOpen) {
      // Calcula a largura da barra de rolagem
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Adiciona padding ao body para compensar a largura da barra de rolagem e evitar saltos
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // Restaura a rolagem da página
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      // Limpeza ao desmontar
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);
  
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
      {/* Overlay escuro atrás do painel */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-500 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Painel deslizante - início com translateX(100%) e depois aplica a classe ativa */}
      <div 
        ref={panelRef}
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-xl z-50 transform ${isRendered ? 'transition-transform duration-500 ease-in-out' : ''} overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ willChange: 'transform' }} // Melhora performance da animação
      >
        {/* Botão de fechar no canto superior */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white shadow-md hover:bg-slate-100 z-10"
          aria-label="Fechar painel"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Carrossel de imagens */}
        <div className="relative h-64 bg-slate-200 overflow-hidden">
          {/* Container do carrossel com transição horizontal */}
          <div className="h-full relative">
            {roomImages.map((imageUrl, index) => (
              <div 
                key={index} 
                className="absolute top-0 left-0 w-full h-full transition-transform duration-700 ease-in-out"
                style={{ 
                  transform: `translateX(${(index - activeImageIndex) * 100}%)`,
                  zIndex: index === activeImageIndex ? 1 : 0
                }}
              >
                <Image 
                  src={imageUrl} 
                  alt={`Imagem ${index + 1} do quarto ${room.name}`}
                  className="w-full h-full object-cover"
                  width={600}
                  height={400}
                  unoptimized={true}
                />
              </div>
            ))}
          </div>
          
          {/* Controles do carrossel */}
          <button 
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
            aria-label="Imagem anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button 
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
            aria-label="Próxima imagem"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          
          {/* Indicadores de imagem */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-10">
            {roomImages.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  idx === activeImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`Ver imagem ${idx + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">{room.name}</h2>
          
          <div className="flex items-center mb-6">
            <span className="text-xl font-bold text-indigo-600 mr-2">
              R$ {room.price.toFixed(2).replace('.',',')}
            </span>
            <span className="text-sm text-slate-500">por noite</span>
          </div>
          
          {/* Detalhes do quarto */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Detalhes</h3>
              <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Capacidade:</span>
                  <span className="font-medium text-slate-800">{room.capacity} pessoa{room.capacity > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Disponibilidade:</span>
                  <span className="font-medium text-green-600">Disponível</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tamanho:</span>
                  <span className="font-medium text-slate-800">{30 + (room.capacity * 5)} m²</span>
                </div>
              </div>
            </div>
            
            {/* Comodidades */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Comodidades</h3>
              <div className="grid grid-cols-2 gap-3">
                {room.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Descrição */}
            <div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Descrição</h3>
              <p className="text-slate-600 leading-relaxed">
                {room.description ? room.description : `
                  Desfrute de uma estadia confortável neste quartos espaçoso e elegante.
                  Perfeito para ${room.capacity === 1 ? 'viajantes solo' : room.capacity <= 2 ? 'casais' : 'famílias'}, 
                  este quarto oferece o equilíbrio perfeito entre conforto e estilo.
                  Com decoração requintada e todas as comodidades modernas, garantimos uma 
                  experiência memorável durante sua estadia.
                `}
              </p>
            </div>
          </div>
          
          {/* Botão de ação */}
          <div className="mt-8">
            <button
              onClick={handleReserve}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
            >
              Reservar agora
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RoomDetailPanel; 