'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  favorites: number[]; // Array of room IDs
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  
  // Favorites actions
  toggleFavorite: (roomId: number) => Promise<void>;
  isFavorite: (roomId: number) => boolean;
}

// URL base da API
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>()(
  persist(
    immer((set, get) => ({
      user: null,
      token: null,
      favorites: [],
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao fazer login');
          }
          
          const data = await response.json();
          
          set({
            user: data.user,
            favorites: data.favorites || [],
            isAuthenticated: true,
            isLoading: false,
            token: data.token
          });
        } catch (error) {
          set({ 
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erro ao fazer login'
          });
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao registrar usuário');
          }
          
          const data = await response.json();
          
          set({
            user: data.user,
            favorites: data.favorites || [],
            isAuthenticated: true,
            isLoading: false,
            token: data.token
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao registrar' 
          });
        }
      },
      
      checkAuth: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          set({ isLoading: true });
          
          const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (!response.ok) {
            // Token inválido ou expirado
            set({
              user: null,
              token: null,
              favorites: [],
              isAuthenticated: false,
              isLoading: false
            });
            return;
          }
          
          const data = await response.json();
          
          set({
            user: data.user,
            favorites: data.favorites,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          set({
            isLoading: false,
            user: null,
            token: null,
            favorites: [],
            isAuthenticated: false
          });
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          favorites: [],
          isAuthenticated: false
        });
      },
      
      toggleFavorite: async (roomId: number) => {
        const { user, favorites, token } = get();
        
        if (!user || !token) return;
        
        const isFav = favorites.includes(roomId);
        const endpoint = isFav ? 'remove' : 'add';
        
        try {
          const response = await fetch(`${API_URL}/api/favorites/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ roomId })
          });
          
          if (!response.ok) {
            throw new Error('Falha ao atualizar favorito');
          }
          
          const data = await response.json();
          
          set(state => {
            state.favorites = data.favorites;
          });
        } catch (error) {
          console.error('Erro ao gerenciar favorito:', error);
        }
      },
      
      isFavorite: (roomId: number) => {
        return get().favorites.includes(roomId);
      }
    })),
    {
      name: 'hotel-auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        favorites: state.favorites,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
); 