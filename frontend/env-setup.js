const fs = require('fs');
const path = require('path');

// Conteúdo do arquivo .env.local para o frontend
const frontendEnvContent = `# Configuração da URL da API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
`;

// Conteúdo do arquivo .env.production para o frontend
const frontendProdEnvContent = `# Configuração da URL da API para produção
# Substitua pela URL real do seu backend em produção
NEXT_PUBLIC_API_BASE_URL=https://seu-backend-api.com
`;

// Conteúdo do arquivo .env.local para o backend
const backendEnvContent = `# Configuração de porta do servidor
PORT=3001

# Outras configurações do backend
NODE_ENV=development
`;

// Função para criar um arquivo se ele não existir
function createFileIfNotExists(filePath, content) {
  if (fs.existsSync(filePath)) {
    console.log(`Arquivo já existe: ${filePath}`);
    return;
  }

  try {
    fs.writeFileSync(filePath, content);
    console.log(`Arquivo criado com sucesso: ${filePath}`);
  } catch (error) {
    console.error(`Erro ao criar arquivo ${filePath}:`, error);
  }
}

// Caminhos dos arquivos
const frontendEnvPath = path.join(__dirname, '.env.local');
const frontendProdEnvPath = path.join(__dirname, '.env.production');
const backendEnvPath = path.join(__dirname, '..', 'backend', '.env');

// Criar os arquivos
createFileIfNotExists(frontendEnvPath, frontendEnvContent);
createFileIfNotExists(frontendProdEnvPath, frontendProdEnvContent);
createFileIfNotExists(backendEnvPath, backendEnvContent);

console.log('\nConfigurações de ambiente concluídas!');
console.log('\nIMPORTANTE: Não compartilhe os arquivos .env em repositórios públicos.');
console.log('Adicione os arquivos .env.local, .env.production e backend/.env ao seu .gitignore.'); 