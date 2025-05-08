// Adicionar dotenv para carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000; // Alterado para 5000 para corresponder ao Docker

// Middleware para parsing de JSON
app.use(express.json());

// Configurar CORS para permitir requisições de qualquer origem
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Cache em memória com TTL (Time To Live) de 5 minutos
const cache = new NodeCache({ stdTTL: 300 });

// Verificar se o banco de dados existe, se não, executar script de inicialização
const dbPath = process.env.DB_PATH || path.join(__dirname, 'hotel.db');
if (!fs.existsSync(dbPath)) {
  console.log('Banco de dados não encontrado. Executando inicialização...');
  require('./init-db');
}

// Rota GET /rooms - buscar quartos com filtros
app.get('/rooms', (req, res) => {
  const queryParams = req.query;
  const cacheKey = JSON.stringify(queryParams); // Chave de cache baseada nos parâmetros

  // Tentar buscar do cache primeiro
  const cachedResult = cache.get(cacheKey);
  if (cachedResult) {
    console.log('Retornando resultado do cache para:', queryParams);
    return res.json(cachedResult);
  }

  console.log('Processando requisição para:', queryParams);

  try {
    // Buscar quartos do banco de dados com os filtros
    const filteredRooms = db.getRooms(queryParams);
    
    // Paginação
    const page = parseInt(queryParams.page, 10) || 1;
    const limit = parseInt(queryParams.limit, 10) || 10; // 10 quartos por página por padrão
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalRooms = filteredRooms.length;
    const paginatedRooms = filteredRooms.slice(startIndex, endIndex);
    
    // Corrigir cálculo de totalPages
    const totalPages = totalRooms <= limit ? 1 : Math.ceil(totalRooms / limit);
    
    const result = {
      rooms: paginatedRooms,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalRooms: totalRooms,
        limit: limit,
      },
    };

    // Armazenar resultado no cache antes de retornar
    cache.set(cacheKey, result);

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar quartos:', error);
    res.status(500).json({ error: 'Erro interno ao buscar quartos' });
  }
});

// Rotas de autenticação e usuários
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }
  
  try {
    const user = db.getUser(email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Retornar dados do usuário (exceto senha) e favoritos
    const { password: _, ...userData } = user;
    const favorites = db.getFavorites(user.id);
    
    res.json({
      user: userData,
      favorites
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }
  
  try {
    // Verificar se usuário já existe
    const existingUser = db.getUser(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }
    
    // Criar novo usuário
    const result = db.createUser(name, email, password);
    
    if (result.changes === 1) {
      res.status(201).json({
        user: {
          id: result.lastInsertRowid,
          name,
          email
        },
        favorites: []
      });
    } else {
      throw new Error('Falha ao criar usuário');
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas para gerenciar favoritos
app.post('/api/favorites/add', (req, res) => {
  const { userId, roomId } = req.body;
  
  if (!userId || !roomId) {
    return res.status(400).json({ error: 'ID do usuário e do quarto são obrigatórios' });
  }
  
  try {
    db.addFavorite(userId, roomId);
    const favorites = db.getFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

app.post('/api/favorites/remove', (req, res) => {
  const { userId, roomId } = req.body;
  
  if (!userId || !roomId) {
    return res.status(400).json({ error: 'ID do usuário e do quarto são obrigatórios' });
  }
  
  try {
    db.removeFavorite(userId, roomId);
    const favorites = db.getFavorites(userId);
    res.json({ favorites });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
}); 