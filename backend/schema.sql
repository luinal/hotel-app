-- Estrutura das tabelas para o banco de dados SQLite

-- Tabela de quartos
CREATE TABLE IF NOT EXISTS rooms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  capacity INTEGER NOT NULL,
  imageUrl TEXT
);

-- Tabela de características
CREATE TABLE IF NOT EXISTS features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE
);

-- Relacionamento entre quartos e características
CREATE TABLE IF NOT EXISTS room_features (
  room_id INTEGER,
  feature_id INTEGER,
  PRIMARY KEY (room_id, feature_id),
  FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE,
  FOREIGN KEY (feature_id) REFERENCES features (id) ON DELETE CASCADE
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS favorites (
  user_id INTEGER,
  room_id INTEGER,
  PRIMARY KEY (user_id, room_id),
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms (id) ON DELETE CASCADE
);

-- Características padrão
INSERT OR IGNORE INTO features (name) VALUES
  ('Wi-Fi'),
  ('Ar-condicionado'),
  ('Varanda'),
  ('Piscina Privativa'),
  ('Vista para o Mar'),
  ('Cozinha Compacta'),
  ('Banheira'),
  ('Lareira'),
  ('Café da Manhã'); 