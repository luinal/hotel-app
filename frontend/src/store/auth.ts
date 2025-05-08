'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
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
  
  // Favorites actions
  toggleFavorite: (roomId: number) => void;
  isFavorite: (roomId: number) => boolean;
}

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
          
          // For this simple implementation, we'll simulate a login
          // In a real app, this would be an API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful login
          if (email === 'user@example.com' && password === 'password') {
            const user = {
              id: '1',
              email: 'user@example.com',
              name: 'Demo User'
            };
            
            set({
              user,
              token: 'mock-jwt-token',
              isAuthenticated: true,
              isLoading: false
            });
          } else {
            throw new Error('Email ou senha inválidos');
          }
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
          
          // Simulate registration delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Mock successful registration
          const user = {
            id: '1',
            email,
            name
          };
          
          set({
            user,
            token: 'mock-jwt-token',
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ 
            isLoading: false, 
            error: error instanceof Error ? error.message : 'Erro ao registrar' 
          });
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },
      
      toggleFavorite: (roomId: number) => {
        set(state => {
          const isFav = state.favorites.includes(roomId);
          
          if (isFav) {
            // Remove from favorites
            state.favorites = state.favorites.filter(id => id !== roomId);
          } else {
            // Add to favorites
            state.favorites.push(roomId);
          }
        });
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