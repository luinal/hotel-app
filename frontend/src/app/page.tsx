'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useFilterStore, availableFeatures } from '@/store/filters';
import RoomList from '@/components/RoomList';
import Filters from '@/components/Filters';
import RoomCount from '@/components/RoomCount';
import PaginationControls from '@/components/PaginationControls';

// Componente interno para encapsular a lógica que depende dos hooks de navegação,
// permitindo o uso de Suspense na página principal.
function SearchPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // Hook para ler os parâmetros da URL

  // Seletores para obter o estado e as ações da store Zustand
  const {
    name, priceMin, priceMax, capacity, features, page,
    setFilters,
    setRoomsLoadingError
  } = useFilterStore();

  // --- Efeito 1: Inicialização dos Filtros a partir da URL --- //
  // Executa apenas uma vez quando o componente é montado.
  // Lê os parâmetros da URL e atualiza o estado Zustand se houver divergência.
  useEffect(() => {
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
      const paramValue = params.get(key) === 'true';
      if (params.has(key) && paramValue !== features[key]) {
          featureUpdate[key] = paramValue;
          featureChanged = true;
      }
    });
    if (featureChanged) {
        initialUpdate.features = { ...features, ...featureUpdate };
        needsUpdate = true;
    }

    if (needsUpdate) {
      setFilters(initialUpdate);
    }
  }, [searchParams, name, priceMin, priceMax, capacity, features, page, setFilters]);

  // --- Efeito 2: Atualização da URL a partir dos Filtros --- //
  // Executa sempre que qualquer filtro (name, priceMin, etc.) ou a página mudar no estado Zustand.
  // Constrói a query string e atualiza a URL do navegador sem recarregar a página.
  useEffect(() => {
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

    // Pega os parâmetros atuais da URL para comparação
    const currentParams = new URLSearchParams(searchParams.toString());

    // Atualiza a URL apenas se os novos parâmetros forem diferentes dos atuais
    // Isso evita atualizações desnecessárias e potenciais loops.
    if (params.toString() !== currentParams.toString()) {
        // router.replace atualiza a URL sem adicionar uma nova entrada no histórico do navegador.
        router.replace(`${pathname}?${params.toString()}`);
    }

  // Dependências do efeito: monitora todas as variáveis de filtro e página do Zustand.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, priceMin, priceMax, capacity, features, page, pathname, router]);

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

      let roomsData = [];
      let paginationData = null;
      let errorData = null;

      // Define a URL base da API backend
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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
  }, [name, priceMin, priceMax, capacity, features, page, setRoomsLoadingError]);

  // Renderização da UI principal, dividida em filtros (aside) e resultados (main)
  return (
    // Container principal da página de busca
    <div className="container px-2 sm:px-4 lg:px-6">
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        {/* Sidebar de Filtros */}
        <aside className="w-full lg:w-60 xl:w-64 self-start mb-8 lg:mb-0">
          {/* O top-24 considera a altura do header (h-16) + um espaçamento */}
          <Filters />
        </aside>
        {/* Conteúdo Principal: Contagem, Lista e Paginação */}
        <main className="flex-1 min-w-0">
          <div className="mb-6 flex items-center justify-between">
            <RoomCount /> {/* Exibe a contagem de resultados */}
            {/* Espaço para futura ordenação, se implementada */}
          </div>
          <RoomList /> {/* Exibe a lista de quartos ou mensagens de status */}
          <div className="mt-8 flex justify-center">
            <PaginationControls /> {/* Controles de paginação */}
        </div>
      </main>
      </div>
    </div>
  );
}

// Componente principal da página exportado
// Utiliza Suspense para lidar com o carregamento inicial dos hooks de navegação (como useSearchParams)
// dentro do SearchPageContent.
export default function HomePage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Carregando filtros...</div>}>
      {/* Renderiza o conteúdo principal apenas quando os hooks de navegação estiverem prontos */}
      <SearchPageContent />
    </Suspense>
  );
}