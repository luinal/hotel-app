# Hotel App - Busca e Filtro de Quartos

Este projeto implementa uma aplicação web para buscar e filtrar quartos de hotel em tempo real, utilizando Next.js para o frontend e Node.js para o backend.

## Funcionalidades

- Busca de quartos por nome.
- Filtro por faixa de preço (mínimo e máximo).
- Filtro por capacidade de pessoas.
- Filtro por características (ex: Wi-Fi, Ar-condicionado).
- Atualização da lista de resultados e contagem de quartos em tempo real.
- Paginação dos resultados.
- Sincronização dos filtros com a URL (search params).
- Carregamento automático dos filtros ao acessar uma URL com parâmetros.
- Backend com API REST para servir os dados dos quartos.
- Cache em memória no backend para otimizar consultas.

## Tecnologias Utilizadas

- **Frontend:**
  - Next.js (v14+ com App Router)
  - React
  - TypeScript
  - Zustand (Gerenciamento de estado global)
  - Tailwind CSS (Estilização)
  - `use-debounce` (Para otimizar inputs de filtro)
- **Backend:**
  - Node.js
  - Express.js
  - Cors
  - Node-cache (Cache em memória)
  - JSON (Base de dados mockada)

## Estrutura do Projeto

```
hotel-app/
├── backend/         # Código do servidor Node.js
│   ├── node_modules/
│   ├── db.json      # Base de dados mockada
│   ├── package.json
│   ├── server.js    # Arquivo principal do servidor
│   └── ...
├── frontend/        # Código da aplicação Next.js
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── app/       # Rotas e páginas principais (App Router)
│   │   ├── components/ # Componentes React reutilizáveis
│   │   ├── store/      # Store Zustand para estado global
│   │   └── ...
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── ...
└── README.md        # Este arquivo
```

## Pré-requisitos

- Node.js (v18 ou superior recomendado)
- npm ou yarn

## Como Rodar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd hotel-app
    ```

2.  **Instale as dependências do Backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Inicie o servidor Backend:**
    ```bash
    npm start
    ```
    O backend estará rodando em `http://localhost:3001`.

4.  **Instale as dependências do Frontend (em outro terminal):**
    ```bash
    cd ../frontend # Volte para a raiz e entre no frontend
    npm install
    ```

5.  **Inicie a aplicação Frontend:**
    ```bash
    npm run dev
    ```
    A aplicação frontend estará disponível em `http://localhost:3000`.

6.  **Abra seu navegador** e acesse `http://localhost:3000`.

## API Backend

- **`GET /rooms`**: Retorna a lista de quartos filtrada e paginada.
  - **Query Parameters:**
    - `name` (string): Filtra por nome (case-insensitive, partial match).
    - `priceMin` (number): Preço mínimo.
    - `priceMax` (number): Preço máximo.
    - `capacity` (number): Capacidade exata.
    - `wifi` (boolean - `true`): Requer Wi-Fi.
    - `ac` (boolean - `true`): Requer Ar-condicionado.
    - `varanda` (boolean - `true`): Requer Varanda.
    - `piscina` (boolean - `true`): Requer Piscina Privativa.
    - `vistaMar` (boolean - `true`): Requer Vista para o Mar.
    - `cozinha` (boolean - `true`): Requer Cozinha Compacta.
    - `banheira` (boolean - `true`): Requer Banheira.
    - `lareira` (boolean - `true`): Requer Lareira.
    - `page` (number): Número da página (default: 1).
    - `limit` (number): Quantidade de itens por página (default: 10).
  - **Exemplo de Resposta:**
    ```json
    {
      "rooms": [
        {
          "id": 1,
          "name": "Suíte Luxo",
          "price": 250,
          "capacity": 2,
          "features": ["Wi-Fi", "Ar-condicionado"]
        }
        // ... outros quartos
      ],
      "pagination": {
        "currentPage": 1,
        "totalPages": 2,
        "totalRooms": 15,
        "limit": 10
      }
    }
    ``` 