// Adicionar dotenv para carregar variáveis de ambiente
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const NodeCache = require('node-cache');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000; // Alterado para 5000 para corresponder ao Docker

// Chave secreta para JWT - em produção deve ser armazenada em variável de ambiente
const JWT_SECRET = process.env.JWT_SECRET || 'hotelapp-jwt-secret';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

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

// Middleware para autenticar token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido ou expirado' });
    req.user = user;
    next();
  });
};

// Função para gerar token JWT
const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

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
    
    // Gerar token JWT
    const token = generateToken(user);
    
    // Retornar dados do usuário (exceto senha) e favoritos
    const { password: _, ...userData } = user;
    const favorites = db.getFavorites(user.id);
    
    res.json({
      user: userData,
      token,
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
      // Buscar o usuário recém-criado para gerar o token
      const newUser = db.getUser(email);
      const token = generateToken(newUser);
      
      res.status(201).json({
        user: {
          id: result.lastInsertRowid,
          name,
          email
        },
        token,
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

// Verificar token e retornar informações do usuário
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.getUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Não enviar a senha
    const { password: _, ...userData } = user;
    const favorites = db.getFavorites(user.id);
    
    res.json({
      user: userData,
      favorites
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

// Rotas para gerenciar favoritos - agora requer autenticação
app.post('/api/favorites/add', authenticateToken, (req, res) => {
  const userId = req.user.id; // Extrair do token
  const { roomId } = req.body;
  
  if (!roomId) {
    return res.status(400).json({ error: 'ID do quarto é obrigatório' });
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

app.post('/api/favorites/remove', authenticateToken, (req, res) => {
  const userId = req.user.id; // Extrair do token
  const { roomId } = req.body;
  
  if (!roomId) {
    return res.status(400).json({ error: 'ID do quarto é obrigatório' });
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