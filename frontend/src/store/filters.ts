import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Room {
  id: number;
  name: string;
  price: number;
  capacity: number;
  features: string[];
  imageUrl?: string;
  description?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalRooms: number;
  limit: number;
}

// Tipos para ordenação
export type OrderBy = '' | 'name' | 'price' | 'capacity';
export type OrderDirection = 'asc' | 'desc';

export interface FilterState {
  name: string;
  priceMin: string; 
  priceMax: string;
  capacity: string;
  features: { [key: string]: boolean };
  favoriteOnly: boolean;
  page: number;
  orderBy: OrderBy;
  orderDirection: OrderDirection;
  rooms: Room[];
  pagination: PaginationInfo | null;
  isLoading: boolean;
  error: string | null;
  setFilters: (partialFilters: Partial<Omit<FilterState, 'setFilters' | 'clearFilters' | 'setPage' | 'setRoomsLoadingError' | 'setOrder' | 'setFavoriteOnly'>>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setOrder: (orderBy: OrderBy, orderDirection: OrderDirection) => void;
  setFavoriteOnly: (favoriteOnly: boolean) => void;
  setRoomsLoadingError: (rooms: Room[], pagination: PaginationInfo | null, isLoading: boolean, error: string | null) => void;
}

// Defina as features disponíveis aqui para usar nos filtros e mapeamento
export const availableFeatures = {
  wifi: 'Wi-Fi',
  ac: 'Ar-condicionado',
  varanda: 'Varanda',
  piscina: 'Piscina Privativa',
  vistaMar: 'Vista para o Mar',
  cozinha: 'Cozinha Compacta',
  banheira: 'Banheira',
  lareira: 'Lareira',
  cafe: 'Café da Manhã',
};

const initialFilters = {
  name: '',
  priceMin: '',
  priceMax: '',
  capacity: '',
  features: Object.keys(availableFeatures).reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as { [key: string]: boolean }),
  favoriteOnly: false,
  page: 1,
  orderBy: '' as OrderBy,
  orderDirection: 'asc' as OrderDirection,
};

export const useFilterStore = create<FilterState>()(
  immer((set) => ({
    ...initialFilters,
    rooms: [] as Room[],
    pagination: null,
    isLoading: false,
    error: null,

    setFilters: (partialFilters) =>
      set((state) => {
        // Atualiza apenas os filtros fornecidos
        Object.assign(state, partialFilters);
        // Reseta a página para 1 sempre que um filtro (exceto a própria página) for alterado
        if (!('page' in partialFilters && Object.keys(partialFilters).length === 1)) {
            state.page = 1;
        }
        // Limpa resultados e erro ao mudar filtros para forçar nova busca
        state.rooms = [];
        state.pagination = null;
        state.error = null;
      }),

    clearFilters: () =>
      set((state) => {
        // Guarda os valores atuais de ordenação
        const currentOrderBy = state.orderBy;
        const currentOrderDirection = state.orderDirection;
        const currentFavoriteOnly = state.favoriteOnly;
        
        // Limpa completamente o estado e define para os valores iniciais
        Object.keys(initialFilters).forEach(key => {
          if (key !== 'orderBy' && key !== 'orderDirection' && key !== 'favoriteOnly') {
            // @ts-expect-error - Necessário para acessar as propriedades dinamicamente
            state[key] = structuredClone(initialFilters[key as keyof typeof initialFilters]);
          }
        });
        
        // Restaura os valores de ordenação e favoritos
        state.orderBy = currentOrderBy;
        state.orderDirection = currentOrderDirection;
        state.favoriteOnly = currentFavoriteOnly;
        
        // Limpa resultados e erro ao limpar filtros
        state.rooms = [];
        state.pagination = null;
        state.error = null;
        state.isLoading = true; // Define como loading para garantir que uma nova busca será feita
      }),

    setPage: (page) =>
      set((state) => {
        state.page = page;
         // Limpa resultados e erro ao mudar página para forçar nova busca
        state.rooms = [];
        state.pagination = null;
        state.error = null;
      }),
      
    setOrder: (orderBy, orderDirection) =>
      set((state) => {
        state.orderBy = orderBy;
        state.orderDirection = orderDirection;
        // Limpa resultados e erro ao mudar ordenação para forçar nova busca
        state.rooms = [];
        state.pagination = null;
        state.error = null;
      }),
      
    setFavoriteOnly: (favoriteOnly) =>
      set((state) => {
        state.favoriteOnly = favoriteOnly;
        // Reset to first page and clear results when toggling favorites filter
        state.page = 1;
        state.rooms = [];
        state.pagination = null;
        state.error = null;
      }),

    setRoomsLoadingError: (rooms, pagination, isLoading, error) =>
      set((state) => {
        state.rooms = rooms;
        state.pagination = pagination;
        state.isLoading = isLoading;
        state.error = error;
      }),
  }))
); 