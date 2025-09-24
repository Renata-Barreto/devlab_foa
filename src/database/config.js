import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtém o diretório raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuração do pool de conexão
const dbConfig = {};

// Priorizar DATABASE_URL (usada no Render ou localmente)
if (process.env.DATABASE_URL) {
  dbConfig.connectionString = process.env.DATABASE_URL;
  // Habilitar SSL se DB_SSL=true ou se DATABASE_URL contém sslmode=require
  const sslRequired = process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('sslmode=require');
  dbConfig.ssl = sslRequired ? { rejectUnauthorized: false } : false;
} else {
  // Configurações para ambiente local sem DATABASE_URL
  dbConfig.database = process.env.DB_NAME;
  dbConfig.user = process.env.DB_USER;
  dbConfig.password = process.env.DB_PASSWORD;
  dbConfig.host = process.env.DB_HOST;
  dbConfig.port = process.env.DB_PORT || 5432;
  dbConfig.ssl = process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
}

// Criar o pool de conexão
const pool = new Pool(dbConfig);

// Testar a conexão
pool.connect()
  .then(() => console.log('Conexão com o banco de dados estabelecida com sucesso. Mensagem do config do database'))
  .catch((error) => console.error('Erro ao conectar ao banco de dados:', error));

// Exportar o pool diretamente
export default pool;

