// Módulo para gerenciar a conexão com o banco de dados SQLite
const Database = require('better-sqlite3');
const path = require('path');

// Caminho para o banco de dados (usa variável de ambiente ou caminho padrão)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'hotel.db');

// Criar conexão com o banco de dados
function connect() {
  const db = new Database(dbPath, { fileMustExist: true });
  db.pragma('foreign_keys = ON');
  return db;
}

// Funções para quartos
function getRooms(filters = {}) {
  const db = connect();
  
  try {
    // Construir a query base
    let query = `
      SELECT DISTINCT r.id, r.name, r.description, r.price, r.capacity, r.imageUrl
      FROM rooms r
    `;
    
    const whereConditions = [];
    const params = [];
    
    // Se existem filtros de características, juntar com tabelas relacionadas
    const hasFeatureFilters = Object.keys(filters).some(key => 
      ['wifi', 'ac', 'varanda', 'piscina', 'vistaMar', 'cozinha', 'banheira', 'lareira', 'cafe'].includes(key));
    
    if (hasFeatureFilters) {
      query += `
        LEFT JOIN room_features rf ON r.id = rf.room_id
        LEFT JOIN features f ON rf.feature_id = f.id
      `;
    }
    
    // Filtro por nome
    if (filters.name) {
      whereConditions.push(`r.name LIKE ?`);
      params.push(`%${filters.name}%`);
    }
    
    // Filtros de preço
    if (filters.priceMin) {
      whereConditions.push(`r.price >= ?`);
      params.push(parseFloat(filters.priceMin));
    }
    
    if (filters.priceMax) {
      whereConditions.push(`r.price <= ?`);
      params.push(parseFloat(filters.priceMax));
    }
    
    // Filtro de capacidade
    if (filters.capacity) {
      whereConditions.push(`r.capacity = ?`);
      params.push(parseInt(filters.capacity, 10));
    }
    
    // Mapear parâmetros de características para nomes no banco
    const featureMap = {
      wifi: 'Wi-Fi',
      ac: 'Ar-condicionado',
      varanda: 'Varanda',
      piscina: 'Piscina Privativa',
      vistaMar: 'Vista para o Mar',
      cozinha: 'Cozinha Compacta',
      banheira: 'Banheira',
      lareira: 'Lareira',
      cafe: 'Café da Manhã'
    };
    
    // Adicionar filtros de características
    const requestedFeatures = [];
    
    for (const [key, value] of Object.entries(filters)) {
      if (featureMap[key] && value === 'true') {
        requestedFeatures.push(featureMap[key]);
      }
    }
    
    if (requestedFeatures.length > 0) {
      // Para cada característica, adicionar uma subconsulta para garantir que o quarto tem TODAS as características pedidas
      for (const feature of requestedFeatures) {
        whereConditions.push(`
          r.id IN (
            SELECT room_id 
            FROM room_features rf 
            JOIN features f ON rf.feature_id = f.id 
            WHERE f.name = ?
          )
        `);
        params.push(feature);
      }
    }
    
    // Adicionar WHERE se houver condições
    if (whereConditions.length > 0) {
      query += ` WHERE ` + whereConditions.join(' AND ');
    }
    
    // Ordenação
    if (filters.orderBy) {
      const field = filters.orderBy === 'name' ? 'r.name' : 
                   filters.orderBy === 'price' ? 'r.price' : 
                   filters.orderBy === 'capacity' ? 'r.capacity' : 'r.id';
      
      const direction = filters.orderDirection === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${field} ${direction}`;
    } else {
      query += ` ORDER BY r.id ASC`;
    }
    
    // Executar a query principal para buscar os quartos filtrados
    const stmt = db.prepare(query);
    const rooms = stmt.all(...params);
    
    // Buscar as características para cada quarto
    const featureStmt = db.prepare(`
      SELECT f.name
      FROM features f
      JOIN room_features rf ON f.id = rf.feature_id
      WHERE rf.room_id = ?
    `);
    
    // Adicionar características a cada quarto
    for (const room of rooms) {
      room.features = featureStmt.all(room.id).map(f => f.name);
    }
    
    return rooms;
  } finally {
    db.close();
  }
}

// Funções para usuários e favoritos
function getUser(email) {
  const db = connect();
  try {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  } finally {
    db.close();
  }
}

function createUser(name, email, password) {
  const db = connect();
  try {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    return stmt.run(name, email, password);
  } finally {
    db.close();
  }
}

function getFavorites(userId) {
  const db = connect();
  try {
    const stmt = db.prepare('SELECT room_id FROM favorites WHERE user_id = ?');
    const results = stmt.all(userId);
    return results.map(row => row.room_id);
  } finally {
    db.close();
  }
}

function addFavorite(userId, roomId) {
  const db = connect();
  try {
    const stmt = db.prepare('INSERT OR IGNORE INTO favorites (user_id, room_id) VALUES (?, ?)');
    return stmt.run(userId, roomId);
  } finally {
    db.close();
  }
}

function removeFavorite(userId, roomId) {
  const db = connect();
  try {
    const stmt = db.prepare('DELETE FROM favorites WHERE user_id = ? AND room_id = ?');
    return stmt.run(userId, roomId);
  } finally {
    db.close();
  }
}

module.exports = {
  getRooms,
  getUser,
  createUser,
  getFavorites,
  addFavorite,
  removeFavorite
}; 