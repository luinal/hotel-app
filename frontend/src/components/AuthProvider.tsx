'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';

// Componente responsável por verificar a autenticação ao carregar a aplicação
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth, isLoading } = useAuthStore();
  
  // Verifica a autenticação ao iniciar a aplicação
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Renderiza os children sem nenhum wrapper adicional
  return <>{children}</>;
} 