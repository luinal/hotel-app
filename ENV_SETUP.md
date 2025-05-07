# Configuração de Variáveis de Ambiente

Este projeto utiliza variáveis de ambiente para configurar diferentes aspectos do sistema em diferentes ambientes (desenvolvimento, produção, etc.). Abaixo estão as instruções para configurar corretamente as variáveis de ambiente.

## Frontend (Next.js)

### Variáveis Disponíveis

- `NEXT_PUBLIC_API_BASE_URL`: URL base da API backend
- `NEXT_PUBLIC_APP_ENV`: Ambiente atual (development, production)

### Como Configurar

1. No diretório `frontend`, execute o script de configuração de ambiente:

```bash
npm run setup-env
```

2. Isso criará os seguintes arquivos:
   - `.env.local`: Para desenvolvimento local
   - `.env.production`: Para ambiente de produção

3. Edite esses arquivos conforme necessário para seu ambiente específico.

### Uso no Código

As variáveis de ambiente no frontend estão disponíveis através de `process.env`:

```javascript
// Exemplo de uso
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
```

## Backend (Node.js/Express)

### Variáveis Disponíveis

- `PORT`: Porta em que o servidor backend será executado
- `FRONTEND_URL`: URL do frontend para configuração de CORS
- `NODE_ENV`: Ambiente de execução (development, production)

### Como Configurar

1. O script de configuração também cria o arquivo `.env` no diretório `backend`.
2. Edite este arquivo para ajustar as configurações conforme necessário.

### Uso no Código

As variáveis de ambiente no backend são carregadas automaticamente pelo pacote `dotenv`:

```javascript
// No início do arquivo server.js
require('dotenv').config();

// Exemplo de uso
const port = process.env.PORT || 3001;
```

## Implantação

Para serviços de hospedagem como Render, Railway ou Fly.io, configure as variáveis de ambiente diretamente no painel de administração do serviço, em vez de depender de arquivos `.env` no repositório.

## Segurança

**IMPORTANTE**: Nunca comite arquivos `.env` no repositório Git. Eles contêm informações sensíveis e devem ser mantidos apenas localmente ou configurados de forma segura no ambiente de produção.

Os arquivos `.env*` já estão incluídos no `.gitignore` para evitar que sejam acidentalmente adicionados ao repositório. 