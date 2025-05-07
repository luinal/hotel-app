# Guia de Deploy do Projeto Hotel App

Este documento contém instruções para fazer deploy do frontend e backend do Hotel App em diferentes serviços de hospedagem.

## Deploy do Backend

### Opções de Deploy Gratuito para o Backend

A seguir, apresentamos as opções mais recomendadas para hospedagem gratuita do backend:

#### 1. Render

O [Render](https://render.com) é uma plataforma excelente para deploy de aplicações web, com um plano gratuito generoso.

**Configuração no Render:**

1. Crie uma conta no Render
2. No dashboard, clique em "New Web Service"
3. Conecte o seu repositório GitHub
4. Configure os seguintes campos:
   - **Nome**: hotel-app-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Diretório**: `/backend` (se o seu backend estiver em uma pasta separada)
   - **Branch**: main (ou master)

5. Variáveis de ambiente:
   - PORT: 10000 (o Render atribui uma porta automaticamente via env PORT)
   - FRONTEND_URL: URL do seu frontend (por exemplo, https://hotel-app-frontend.vercel.app)
   - NODE_ENV: production

6. Clique em "Create Web Service"

#### 2. Railway

O [Railway](https://railway.app) é uma plataforma de deploy simples e poderosa com um plano gratuito que oferece $5 de crédito por mês.

**Configuração no Railway:**

1. Crie uma conta no Railway
2. Crie um novo projeto
3. Selecione "Deploy from GitHub repo"
4. Configure as seguintes opções:
   - **Repositório**: seu-repositorio/hotel-app
   - **Diretório**: backend

5. Variáveis de ambiente:
   - PORT: 3001
   - FRONTEND_URL: URL do seu frontend
   - NODE_ENV: production

6. Clique em "Deploy"

#### 3. Fly.io

O [Fly.io](https://fly.io) é um serviço que permite executar aplicações próximas aos usuários, com um plano gratuito que inclui 3 VMs e 3GB de armazenamento.

**Configuração no Fly.io:**

1. Instale o Flyctl:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Faça login:
   ```bash
   fly auth login
   ```

3. No diretório do seu backend:
   ```bash
   fly launch
   ```

4. Configure as variáveis de ambiente:
   ```bash
   fly secrets set PORT=8080 FRONTEND_URL=https://seu-frontend.vercel.app NODE_ENV=production
   ```

5. Deploy:
   ```bash
   fly deploy
   ```

## Deploy do Frontend (Next.js) no Vercel

O [Vercel](https://vercel.com) é a plataforma ideal para aplicações Next.js, desenvolvida pelos mesmos criadores do Next.js.

**Configuração no Vercel:**

1. Crie uma conta no Vercel (ou faça login)
2. Importe seu repositório do GitHub
3. Configure as seguintes opções:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (se o seu frontend estiver em uma pasta separada)

4. Variáveis de ambiente:
   - NEXT_PUBLIC_API_BASE_URL: URL do seu backend (exemplo: https://hotel-app-backend.onrender.com)

5. Clique em "Deploy"

## Conectando Frontend ao Backend Hospedado

Após fazer o deploy do backend, você precisará atualizar o frontend para usar a URL do backend hospedado:

1. No painel de configuração do projeto no Vercel, vá para "Settings" > "Environment Variables"
2. Adicione a variável:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://sua-api-backend.render.com
   ```

3. Clique em "Save" e depois em "Redeploy" para aplicar as novas variáveis.

## Limites dos Serviços Gratuitos

- Os serviços gratuitos geralmente têm limitações como:
  - Tempo de inatividade após período sem uso (cold starts)
  - Limite de banda ou solicitações
  - Recursos computacionais limitados

- Para projetos em produção ou que precisam de alta disponibilidade, considere um plano pago ou serviço mais robusto.

## Recomendações Adicionais

1. **Monitoramento**: Verifique regularmente o painel de controle do serviço para monitorar o uso e evitar surpresas.

2. **Logs**: Configure alertas de log para ser notificado sobre problemas.

3. **Segurança**: Use variáveis de ambiente para todas as configurações sensíveis e NUNCA as comite no repositório.

4. **Backups**: Faça backup regular dos seus dados, especialmente se estiver usando um banco de dados.

5. **CORS**: Certifique-se de que a configuração de CORS no backend permita requisições do seu frontend hospedado. 