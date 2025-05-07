# Hotel App - Busca e Filtro de Quartos

Este projeto implementa uma aplicação web para buscar e filtrar quartos de hotel em tempo real, utilizando Next.js para o frontend e Node.js para o backend.

**Demo:** [https://hotel-app-ochre-five.vercel.app/](https://hotel-app-ochre-five.vercel.app/)

## Funcionalidades

- Busca de quartos por nome.
- Filtro por faixa de preço (mínimo e máximo), capacidade de pessoas e características (ex: Wi-Fi, Ar-condicionado).
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
- **Backend:**
  - Node.js
  - Express.js
  - Cors
  - Node-cache (Cache em memória)
  - Dotenv (Variáveis de ambiente)
  - JSON (Base de dados mockada)

## Estrutura do Projeto

```
hotel-app/
├── backend/         # Código do servidor Node.js
│   ├── node_modules/
│   ├── db.json      # Base de dados mockada
│   ├── .env         # Variáveis de ambiente do backend (não versionado)
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
│   ├── .env.local     # Variáveis de ambiente para desenvolvimento (não versionado)
│   ├── .env.production # Variáveis de ambiente para produção (não versionado)
│   ├── env-setup.js   # Script para configurar variáveis de ambiente
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── ...
├── ENV_SETUP.md     # Documentação de variáveis de ambiente
├── DEPLOY.md        # Guia de deploy do projeto
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

2.  **Configurar variáveis de ambiente:**
    ```bash
    cd frontend
    npm run setup-env
    ```
    Isso criará os arquivos `.env.local` e `.env.production` para o frontend e `.env` para o backend com configurações padrão.

3.  **Instale as dependências do Backend:**
    ```bash
    cd ../backend
    npm install
    ```

4.  **Inicie o servidor Backend:**
    ```bash
    npm run dev
    ```
    O backend estará rodando em `http://localhost:3001`.

5.  **Instale as dependências do Frontend (em outro terminal):**
    ```bash
    cd ../frontend
    npm install
    ```

6.  **Inicie a aplicação Frontend:**
    ```bash
    npm run dev
    ```
    A aplicação frontend estará disponível em `http://localhost:3000`.

7.  **Abra seu navegador** e acesse `http://localhost:3000`.

## Variáveis de Ambiente

O projeto utiliza variáveis de ambiente para configurar diferentes ambientes (desenvolvimento, produção). Para mais detalhes, consulte o arquivo [ENV_SETUP.md](./ENV_SETUP.md).

### Frontend (Next.js)
- `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend (default: http://localhost:3001)
- `NEXT_PUBLIC_APP_ENV`: Ambiente atual (development, production)

### Backend (Node.js)
- `PORT`: Porta em que o servidor backend será executado (default: 3001)
- `FRONTEND_URL`: URL do frontend para configuração de CORS (default: http://localhost:3000)
- `NODE_ENV`: Ambiente de execução (development, production)

## Deploy

Para instruções detalhadas sobre como fazer deploy deste projeto em serviços de hospedagem, consulte o arquivo [DEPLOY.md](./DEPLOY.md). O documento contém guias para:

- Deploy do backend em serviços gratuitos (Render, Railway, Fly.io)
- Deploy do frontend no Vercel
- Configuração das variáveis de ambiente em produção

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