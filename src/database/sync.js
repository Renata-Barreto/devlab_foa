import pool from './config.js';

const syncDatabase = async () => {
  try {
    await pool.connect();
    console.log('Conexão com o banco de dados estabelecida com sucesso. Mensagem do sync do database');
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    throw error; // Propagar o erro para o servidor
  }
};

export default syncDatabase; //
