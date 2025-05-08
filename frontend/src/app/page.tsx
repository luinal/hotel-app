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

// Componente interno para encapsular a lógica que depende dos hooks de navegação,
// permitindo o uso de Suspense na página principal.
function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Hook para ler os parâmetros da URL
  
  // Controle para evitar loops de atualização
  const isUpdatingFromUrl = useRef(false);
  const isUpdatingUrl = useRef(false);

  // Seletores para obter o estado e as ações da store Zustand
  const {
    name, priceMin, priceMax, capacity, features, page,
    orderBy, orderDirection,
    setFilters,
    setRoomsLoadingError
  } = useFilterStore();

  // --- Efeito 1: Inicialização dos Filtros a partir da URL --- //
  // Executa apenas uma vez quando o componente é montado.
  // Lê os parâmetros da URL e atualiza o estado Zustand se houver divergência.
  useEffect(() => {
    if (isUpdatingUrl.current) return; // Evita loop se estiver atualizando da store para URL
    
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
    
    // Inicializa todas as features como false primeiro
    Object.keys(availableFeatures).forEach(key => {
      featureUpdate[key] = false;
    });
    
    // Depois atualiza apenas as features presentes na URL
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

    // Verifica os parâmetros de ordenação
    if (params.has('orderBy')) {
      const urlOrderBy = params.get('orderBy')!;
      // Verifica se o valor é um dos valores válidos de orderBy
      if (['name', 'price', 'capacity', ''].includes(urlOrderBy) && urlOrderBy !== orderBy) {
        initialUpdate.orderBy = urlOrderBy as 'name' | 'price' | 'capacity' | '';
        needsUpdate = true;
      }
    }
    if (params.has('orderDirection') && params.get('orderDirection') !== orderDirection) {
      initialUpdate.orderDirection = params.get('orderDirection') === 'desc' ? 'desc' : 'asc';
      needsUpdate = true;
    }

    if (needsUpdate) {
      setFilters(initialUpdate);
    }
    
    // Desativa a flag após a atualização
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 0);
  }, [searchParams, name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, setFilters]);

  // --- Efeito 2: Atualização da URL a partir dos Filtros --- //
  // Executa sempre que qualquer filtro (name, priceMin, etc.) ou a página mudar no estado Zustand.
  // Constrói a query string e atualiza a URL do navegador sem recarregar a página.
  useEffect(() => {
    if (isUpdatingFromUrl.current) return; // Evita loop se estiver atualizando da URL para store
    
    isUpdatingUrl.current = true;
    
    const params = new URLSearchParams();
    // Adiciona os filtros ao objeto URLSearchParams se tiverem valor
    if (name) params.set('name', name);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    if (capacity) params.set('capacity', capacity);
    Object.entries(features).forEach(([key, value]) => {
      if (value) params.set(key, 'true'); // Adiciona apenas features ativas
    });
    if (page > 1) params.set('page', page.toString()); // Adiciona página se não for a primeira
    if (orderBy) {
      params.set('orderBy', orderBy);
      params.set('orderDirection', orderDirection);
    }

    // Pega os parâmetros atuais da URL para comparação
    const currentParams = new URLSearchParams(searchParams.toString());

    // Atualiza a URL apenas se os novos parâmetros forem diferentes dos atuais
    // Isso evita atualizações desnecessárias e potenciais loops.
    if (params.toString() !== currentParams.toString()) {
        // router.replace atualiza a URL sem adicionar uma nova entrada no histórico do navegador.
        router.replace(`${pathname}?${params.toString()}`);
    }
    
    // Desativa a flag após a atualização
    setTimeout(() => {
      isUpdatingUrl.current = false;
    }, 0);

  // Dependências do efeito: monitora todas as variáveis de filtro e página do Zustand.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, pathname, router]);

  // --- Efeito 3: Busca de Dados da API --- //
  // Executa sempre que os filtros ou a página mudam (após os efeitos anteriores).
  // Dispara a busca dos dados na API do backend.
  useEffect(() => {
    const fetchData = async () => {
      const startTime = Date.now(); // Marca o tempo de início
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

      let roomsData = [];
      let paginationData = null;
      let errorData = null;

      // Define a URL base da API backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

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
      const remainingTime = 1000 - elapsedTime; // 1000ms = 1 segundo

      if (remainingTime > 0) {
        setTimeout(() => {
          setRoomsLoadingError(roomsData, paginationData, false, errorData);
        }, remainingTime);
      } else {
        setRoomsLoadingError(roomsData, paginationData, false, errorData);
      }
    };

    fetchData();
  // Dependências: busca novamente sempre que um filtro relevante ou a página mudar.
  }, [name, priceMin, priceMax, capacity, features, page, orderBy, orderDirection, setRoomsLoadingError]);

  // Renderização da UI principal, dividida em filtros (aside) e resultados (main)
  return (
    // Container principal da página de busca
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
        {/* Sidebar de Filtros */}
        <Box sx={{ width: { xs: '100%', lg: '280px' }, mb: { xs: 4, lg: 0 } }}>
          {/* O top-24 considera a altura do header (h-16) + um espaçamento */}
          <Filters />
        </Box>
        {/* Conteúdo Principal: Contagem, Lista e Paginação */}
        <Box sx={{ width: { xs: '100%', lg: 'calc(100% - 300px)' } }}>
          <Box mb={3} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center' }}>
            <RoomCount /> {/* Exibe a contagem de resultados */}
            <Box mb={{ xs: 2, sm: 0 }}>
              <SortControls /> {/* Controles de ordenação */}
            </Box>
          </Box>
          <RoomList /> {/* Exibe a lista de quartos ou mensagens de status */}
          <Box mt={4} display="flex" justifyContent="center">
            <PaginationControls /> {/* Controles de paginação */}
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

// Componente principal da página exportado
// Utiliza Suspense para lidar com o carregamento inicial dos hooks de navegação (como useSearchParams)
// dentro do SearchPageContent.
export default function HomePage() {
  return (
    <Suspense fallback={<Box sx={{ p: 2 }}>Carregando filtros...</Box>}>
      <SearchPageContent />
    </Suspense>
  );
}