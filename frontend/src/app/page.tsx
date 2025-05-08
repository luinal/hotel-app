'use client';

import { useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilterStore, availableFeatures } from '@/store/filters';
import RoomList from '@/components/RoomList';
import Filters from '@/components/Filters';
import RoomCount from '@/components/RoomCount';
import PaginationControls from '@/components/PaginationControls';
import SortControls from '@/components/SortControls';
import { Container, Box } from '@mui/material';

function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isUpdatingFromUrl = useRef(false);
  const isUpdatingUrl = useRef(false);

  const {
    name, priceMin, priceMax, capacity, features, page,
    orderBy, orderDirection, favoriteOnly,
    setFilters,
    setRoomsLoadingError
  } = useFilterStore();

  // Sincroniza URL → Estado
  useEffect(() => {
    if (isUpdatingUrl.current) return;
    
    isUpdatingFromUrl.current = true;
    
    const params = new URLSearchParams(searchParams.toString());
    const initialUpdate: Parameters<typeof setFilters>[0] = {};
    let needsUpdate = false;

    if (params.has('name') && params.get('name') !== name) {
      initialUpdate.name = params.get('name')!;
      needsUpdate = true;
    }
    if (params.has('priceMin') && params.get('priceMin') !== priceMin) {
      initialUpdate.priceMin = params.get('priceMin')!;
      needsUpdate = true;
    }
    if (params.has('priceMax') && params.get('priceMax') !== priceMax) {
      initialUpdate.priceMax = params.get('priceMax')!;
      needsUpdate = true;
    }
    if (params.has('capacity') && params.get('capacity') !== capacity) {
      initialUpdate.capacity = params.get('capacity')!;
      needsUpdate = true;
    }
    if (params.has('page')) {
      const urlPage = parseInt(params.get('page')!, 10);
      if (!isNaN(urlPage) && urlPage !== page) {
          initialUpdate.page = urlPage;
          needsUpdate = true;
      }
    }

    const featureUpdate: { [key: string]: boolean } = {};
    let featureChanged = false;
    
    Object.keys(availableFeatures).forEach(key => {
      featureUpdate[key] = false;
    });
    
    Object.keys(availableFeatures).forEach(key => {
      if (params.has(key)) {
        const paramValue = params.get(key) === 'true';
        featureUpdate[key] = paramValue;
        if (paramValue !== features[key]) {
          featureChanged = true;
        }
      }
    });
    
    if (featureChanged) {
      initialUpdate.features = featureUpdate;
      needsUpdate = true;
    }

    if (params.has('orderBy')) {
      const urlOrderBy = params.get('orderBy')!;
      if (['name', 'price', 'capacity', ''].includes(urlOrderBy) && urlOrderBy !== orderBy) {
        initialUpdate.orderBy = urlOrderBy as 'name' | 'price' | 'capacity' | '';
        needsUpdate = true;
      }
    }
    if (params.has('orderDirection') && params.get('orderDirection') !== orderDirection) {
      initialUpdate.orderDirection = params.get('orderDirection') === 'desc' ? 'desc' : 'asc';
      needsUpdate = true;
    }
    
    if (params.has('favoriteOnly')) {
      const urlFavoriteOnly = params.get('favoriteOnly') === 'true';
      if (urlFavoriteOnly !== favoriteOnly) {
        initialUpdate.favoriteOnly = urlFavoriteOnly;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      setFilters(initialUpdate);
    }
    
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 0);
  }, [searchParams, name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, favoriteOnly, setFilters]);

  // Sincroniza Estado → URL
  useEffect(() => {
    if (isUpdatingFromUrl.current) return;
    
    isUpdatingUrl.current = true;
    
    const params = new URLSearchParams();
    if (name) params.set('name', name);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (capacity) params.set('capacity', capacity);
    Object.entries(features).forEach(([key, value]) => {
      if (value) params.set(key, 'true');
    });
    if (page > 1) params.set('page', page.toString());
    if (orderBy) {
      params.set('orderBy', orderBy);
      params.set('orderDirection', orderDirection);
    }
    if (favoriteOnly) {
      params.set('favoriteOnly', 'true');
    }

    const currentParams = new URLSearchParams(searchParams.toString());

    if (params.toString() !== currentParams.toString()) {
        router.replace(`${pathname}?${params.toString()}`);
    }
    
    setTimeout(() => {
      isUpdatingUrl.current = false;
    }, 0);
  }, [name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, favoriteOnly, pathname, router, searchParams]);

  // Busca dados da API
  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now();
      setRoomsLoadingError([], null, true, null);
      const params = new URLSearchParams();
      if (name) params.set('name', name);
      if (priceMin) params.set('priceMin', priceMin);
      if (priceMax) params.set('priceMax', priceMax);
      if (capacity) params.set('capacity', capacity);
      Object.entries(features).forEach(([key, value]) => {
        if (value) params.set(key, 'true');
      });
      params.set('page', page.toString());
      params.set('limit', '10');
      if (orderBy) {
        params.set('orderBy', orderBy);
        params.set('orderDirection', orderDirection);
      }
      if (favoriteOnly) {
        params.set('favoriteOnly', 'true');
      }

      let roomsData = [];
      let paginationData = null;
      let errorData = null;

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

      try {
        const response = await fetch(`${apiBaseUrl}/rooms?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        roomsData = data.rooms;
        paginationData = data.pagination;
      } catch (e: unknown) {
        console.error("Failed to fetch rooms:", e);
        let errorMessage = 'Falha ao buscar quartos.';
        if (e instanceof Error) {
          errorMessage = e.message;
        } else if (typeof e === 'string') {
          errorMessage = e;
        }
        errorData = errorMessage;
      }

      const elapsedTime = Date.now() - startTime;
      const remainingTime = 1000 - elapsedTime;

      if (remainingTime > 0) {
        setTimeout(() => {
          setRoomsLoadingError(roomsData, paginationData, false, errorData);
        }, remainingTime);
      } else {
        setRoomsLoadingError(roomsData, paginationData, false, errorData);
      }
    };

    fetchData();
  }, [name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, favoriteOnly, setRoomsLoadingError]);

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        px: { xs: 1, sm: 2, lg: 3 }, 
        mx: 0, 
        width: '100%', 
        maxWidth: '100%'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' }, 
        gap: 2, 
        justifyContent: 'flex-start',
        alignItems: 'flex-start'
      }}>
        <Box sx={{ width: { xs: '100%', lg: '280px' }, mb: { xs: 4, lg: 0 } }}>
          <Filters />
        </Box>
        <Box sx={{ width: { xs: '100%', lg: 'calc(100% - 300px)' } }}>
          <Box mb={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <RoomCount />
            <Box mb={{ xs: 2, sm: 0 }}>
              <SortControls />
            </Box>
          </Box>
          <RoomList />
          <Box mt={4} display="flex" justifyContent="center">
            <PaginationControls />
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<Box sx={{ p: 2 }}>Carregando filtros...</Box>}>
      <SearchPageContent />
    </Suspense>
  );
}