# Hotel App - Busca e Filtro de Quartos

Este projeto implementa uma aplicação web para buscar e filtrar quartos de hotel em tempo real, utilizando Next.js para o frontend e Node.js com SQLite para o backend.

**Demo:** [https://hotel-app-ochre-five.vercel.app/](https://hotel-app-ochre-five.vercel.app/)

## Funcionalidades

- Filtro por nome, faixa de preço (mínimo e máximo), capacidade de pessoas, favoritos e características (ex: Wi-Fi, Ar-condicionado).
- Atualização da lista de resultados e contagem de quartos em tempo real.
- Paginação dos resultados.
- Sincronização dos filtros com a URL (search params).
- Sistema de autenticação (login/cadastro) com funcionalidade de favoritos para usuários autenticados.
- Backend com API REST usando SQLite como banco de dados.
- Cache em memória no backend para otimizar consultas.
- Compatível com dispositivos mobile.
- Virtualização com Docker.

## Tecnologias Utilizadas

- **Frontend:**
  - Next.js (v14+ com App Router)
  - React
  - TypeScript
  - Zustand (Gerenciamento de estado global)
  - Material UI (Estilização)
- **Backend:**
  - Node.js
  - Express.js
  - SQLite (Banco de dados)
  - Better-SQLite3 (Interface para SQLite)
  - Cors
  - Node-cache (Cache em memória)
  - Dotenv (Variáveis de ambiente)

## Estrutura do Projeto

```
hotel-app/
├── backend/          # Código do servidor Node.js
│   ├── node_modules/
│   ├── db.json       # Dados iniciais (importados para SQLite)
│   ├── schema.sql    # Definição do esquema do banco de dados
│   ├── init-db.js    # Script para inicializar o banco
│   ├── db.js         # Módulo de acesso ao banco de dados
│   ├── .env          # Variáveis de ambiente do backend (não versionado)
│   ├── hotel.db      # Banco de dados SQLite (gerado)
│   ├── package.json
│   ├── server.js     # Arquivo principal do servidor
│   └── ...
├── frontend/         # Código da aplicação Next.js
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── app/        # Rotas e páginas principais (App Router)
│   │   ├── components/ # Componentes React reutilizáveis
│   │   │   ├── AuthDialog.tsx    # Modal de autenticação
│   │   │   ├── Filters.tsx       # Painel de filtros
│   │   │   ├── Header.tsx        # Cabeçalho com menu de usuário
│   │   │   ├── RoomCard.tsx      # Card de quartos com botão de favorito
│   │   │   ├── UserMenu.tsx      # Menu de usuário com avatar e favoritos
│   │   │   └── ...
│   │   ├── store/      # Store Zustand para estado global
│   │   │   ├── filters.ts  # Estado dos filtros
│   │   │   ├── auth.ts     # Estado de autenticação e favoritos
│   │   │   └── ...
│   │   └── ...
│   ├── .env.local      # Variáveis de ambiente para desenvolvimento (não versionado)
│   ├── .env.production # Variáveis de ambiente para produção (não versionado)
│   ├── package.json
│   ├── next.config.js
│   └── ...
├── docker-compose.yml  # Configuração para Docker Compose
├── README.md           # Este arquivo
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

3.  **Inicialize o banco de dados SQLite:**
    ```bash
    npm run init-db
    ```
    Isso criará o arquivo `hotel.db` com o esquema e dados iniciais.

4.  **Inicie o servidor Backend:**
    ```bash
    npm run dev
    ```
    O backend estará rodando em `http://localhost:8000`.

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

## Como Rodar com Docker

Se preferir utilizar Docker, o projeto está configurado com docker-compose para facilitar a execução.

1. **Pré-requisitos:**
   - Docker instalado
   - Docker Compose instalado

2. **Clone o repositório:**
   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd hotel-app
   ```

3. **Inicie os contêineres:**
   ```bash
   docker-compose up -d
   ```
   Isso irá:
   - Construir as imagens do frontend e backend
   - Iniciar os contêineres em modo detached (segundo plano)
   - Inicializar automaticamente o banco de dados SQLite
   - Mapear as portas necessárias

4. **Acesse a aplicação:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

5. **Visualizar logs dos contêineres:**
   ```bash
   docker logs hotel-app-frontend-1 -f  # Frontend logs
   docker logs hotel-app-backend-1 -f   # Backend logs
   ```

6. **Parar os contêineres:**
   ```bash
   docker-compose down
   ```

### Dados de Persistência

O Docker Compose configura um volume nomeado `sqlite-data` para persistir o banco de dados SQLite entre reinicializações dos contêineres. Isso garante que seus dados (incluindo usuários e favoritos) sejam mantidos.

## API Backend

### Quartos

- **`GET /rooms`**: Retorna a lista de quartos filtrada e paginada.
  - **Query Parameters:**
    - `name` (string): Filtra por nome (case-insensitive, partial match).
    - `priceMin` (number): Preço mínimo.
    - `priceMax` (number): Preço máximo.
    - `capacity` (number): Capacidade exata.
    - `wifi`, `ac`, `varanda`, etc. (boolean - `true`): Filtros de características.
    - `favoriteOnly` (boolean): Apenas quartos favoritos (requer autenticação).
    - `page` (number): Número da página (default: 1).
    - `limit` (number): Quantidade de itens por página (default: 10).
    - `orderBy`: Campo para ordenação (`name`, `price`, `capacity`).
    - `orderDirection`: Direção da ordenação (`asc`, `desc`).
  - **Exemplo de Resposta:**
    ```json
    {
      "rooms": [
        {
          "id": 1,
          "name": "Suíte Luxo",
          "price": 250,
          "capacity": 2,
          "features": ["Wi-Fi", "Ar-condicionado"],
          "imageUrl": "/images/rooms/suite-luxo.jpg"
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

### Autenticação

- **`POST /api/auth/login`**: Autentica um usuário.
  - **Body:**
    ```json
    {
      "email": "usuario@email.com",
      "password": "senha123"
    }
    ```
  - **Resposta:**
    ```json
    {
      "user": {
        "id": 1,
        "name": "Usuário Teste",
        "email": "usuario@email.com"
      },
      "favorites": [1, 3, 5]
    }
    ```

- **`POST /api/auth/register`**: Registra um novo usuário.
  - **Body:**
    ```json
    {
      "name": "Novo Usuário",
      "email": "novo@email.com",
      "password": "senha123"
    }
    ```
  - **Resposta:**
    ```json
    {
      "user": {
        "id": 2,
        "name": "Novo Usuário",
        "email": "novo@email.com"
      },
      "favorites": []
    }
    ```

### Favoritos

- **`POST /api/favorites/add`**: Adiciona um quarto aos favoritos.
  - **Body:**
    ```json
    {
      "userId": 1,
      "roomId": 2
    }
    ```
  - **Resposta:**
    ```json
    {
      "favorites": [1, 2, 3, 5]
    }
    ```

- **`POST /api/favorites/remove`**: Remove um quarto dos favoritos.
  - **Body:**
    ```json
    {
      "userId": 1,
      "roomId": 2
    }
    ```
  - **Resposta:**
    ```json
    {
      "favorites": [1, 3, 5]
    }
    ``` 