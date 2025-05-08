FROM node:18-alpine

# Instalar dependências do SQLite
RUN apk add --no-cache sqlite

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Criar diretório para o banco de dados e definir permissões
RUN mkdir -p /app/data && \
    chmod -R 755 /app/data

# Definir variável de ambiente para o caminho do banco de dados
ENV DB_PATH=/app/data/hotel.db

# Volume para persistir o banco de dados
VOLUME ["/app/data"]

# Inicializar o banco de dados
RUN npm run init-db

EXPOSE 8000

CMD ["npm", "run", "dev"] 