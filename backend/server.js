const express = require('express');
const cors = require('cors');
const fs = require('fs');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3001; // Porta para o backend

// Configurar CORS para permitir requisições do frontend (ajuste a origin conforme necessário)
app.use(cors({
  origin: 'http://localhost:3000' // Endereço do seu frontend Next.js
}));

// Cache em memória com TTL (Time To Live) de 5 minutos
const cache = new NodeCache({ stdTTL: 300 });

// Carregar dados dos quartos do JSON
let allRooms = [];
try {
  const rawData = fs.readFileSync('db.json');
  allRooms = JSON.parse(rawData);
  console.log(`Carregados ${allRooms.length} quartos do db.json`);
} catch (error) {
  console.error('Erro ao ler db.json:', error);
  // Em caso de erro, a API retornará um array vazio, mas o servidor continuará rodando.
}

// Mapeamento de query params para nomes de features no JSON
const featureMap = {
  wifi: 'Wi-Fi',
  ac: 'Ar-condicionado',
  varanda: 'Varanda',
  piscina: 'Piscina Privativa',
  vistaMar: 'Vista para o Mar',
  cozinha: 'Cozinha Compacta',
  banheira: 'Banheira',
  lareira: 'Lareira',
  rate: 'Avaliação',
};

// Rota GET /rooms
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

  let filteredRooms = [...allRooms];

  // Aplicar filtros
  if (queryParams.name) {
    filteredRooms = filteredRooms.filter(room =>
      room.name.toLowerCase().includes(queryParams.name.toLowerCase())
    );
  }

  if (queryParams.priceMin) {
    const minPrice = parseFloat(queryParams.priceMin);
    if (!isNaN(minPrice)) {
      filteredRooms = filteredRooms.filter(room => room.price >= minPrice);
    }
  }

  if (queryParams.priceMax) {
    const maxPrice = parseFloat(queryParams.priceMax);
    if (!isNaN(maxPrice)) {
      filteredRooms = filteredRooms.filter(room => room.price <= maxPrice);
    }
  }

  if (queryParams.capacity) {
    const capacity = parseInt(queryParams.capacity, 10);
    if (!isNaN(capacity)) {
      filteredRooms = filteredRooms.filter(room => room.capacity === capacity);
    }
  }

  // Filtrar por features (verifica se *todas* as features solicitadas estão presentes)
  const requestedFeatures = Object.keys(featureMap)
    .filter(key => queryParams[key] === 'true') // Pega apenas as features marcadas como true
    .map(key => featureMap[key]); // Mapeia para o nome real da feature

  if (requestedFeatures.length > 0) {
    filteredRooms = filteredRooms.filter(room =>
      requestedFeatures.every(feature => room.features.includes(feature))
    );
  }

  // Paginação
  const page = parseInt(queryParams.page, 10) || 1;
  const limit = parseInt(queryParams.limit, 10) || 10; // 10 quartos por página por padrão
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const totalRooms = filteredRooms.length;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalRooms / limit);

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
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
}); 