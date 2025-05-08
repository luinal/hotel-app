// Script para inicializar o banco de dados SQLite com dados de exemplo
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

// Caminho para o banco de dados (usa variável de ambiente ou caminho padrão)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'hotel.db');

// Caminho para o arquivo de esquema SQL
const schemaPath = path.join(__dirname, 'schema.sql');

// Arquivo JSON com dados simulados
const jsonDataPath = path.join(__dirname, 'db.json');

// Inicializar banco de dados
function initDb() {
  console.log('Inicializando banco de dados SQLite...');
  
  // Verifica se o banco já existe
  const dbExists = fs.existsSync(dbPath);
  
  // Conectar ao banco de dados (cria se não existir)
  const db = new Database(dbPath);
  
  // Habilitar chaves estrangeiras
  db.pragma('foreign_keys = ON');
  
  // Executar o esquema SQL
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSQL);
  console.log('Esquema SQL aplicado.');
  
  // Verificar se já existem dados
  const roomCount = db.prepare('SELECT COUNT(*) as count FROM rooms').get();
  
  if (roomCount.count === 0) {
    console.log('Banco de dados vazio. Importando dados do JSON...');
    importDataFromJson(db);
  } else {
    console.log(`Banco de dados já contém ${roomCount.count} quartos.`);
  }
  
  db.close();
}

// Importar dados do JSON para o SQLite
function importDataFromJson(db) {
  try {
    // Ler dados do JSON
    const data = JSON.parse(fs.readFileSync(jsonDataPath, 'utf8'));
    
    // Iniciar transação
    const transaction = db.transaction(() => {
      // Preparar statements
      const insertRoom = db.prepare(`
        INSERT INTO rooms (id, name, description, price, capacity, imageUrl)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      const getFeatureId = db.prepare(`
        SELECT id FROM features WHERE name = ?
      `);
      
      const insertRoomFeature = db.prepare(`
        INSERT INTO room_features (room_id, feature_id)
        VALUES (?, ?)
      `);
      
      // Inserir cada quarto
      for (const room of data) {
        // Inserir quarto
        insertRoom.run(
          room.id,
          room.name,
          room.description || null,
          room.price,
          room.capacity,
          room.imageUrl || null
        );
        
        // Inserir relacionamentos com características
        for (const feature of room.features) {
          const featureRow = getFeatureId.get(feature);
          if (featureRow) {
            insertRoomFeature.run(room.id, featureRow.id);
          }
        }
      }
    });
    
    // Executar transação
    transaction();
    console.log(`Importados ${data.length} quartos com sucesso.`);
    
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    process.exit(1);
  }
}

// Executar a inicialização
initDb(); 