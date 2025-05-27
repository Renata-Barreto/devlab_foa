import { Pool } from 'pg';
import dbConfig from './config.js';

// Criar o pool de conexão
const pool = new Pool(dbConfig);

const syncDatabase = async () => {
  try {
    await pool.connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    // Não é necessário sincronizar schema, pois já foi criado via SQL
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  } finally {
    // O pool gerencia conexões automaticamente, não precisa fechar manualmente
  }
};

export default syncDatabase;