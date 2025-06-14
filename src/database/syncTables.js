import pool from './config.js';

const syncTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topicos (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES dev_lab_usuarios(id_usr) ON DELETE CASCADE,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE SET NULL,
        titulo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS topico_tags (
        topico_id INTEGER NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
        tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (topico_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS respostas (
        id SERIAL PRIMARY KEY,
        topico_id INTEGER NOT NULL REFERENCES topicos(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES dev_lab_usuarios(id_usr) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS respostas_replies (
        id SERIAL PRIMARY KEY,
        resposta_id INTEGER NOT NULL REFERENCES respostas(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES dev_lab_usuarios(id_usr) ON DELETE CASCADE,
        conteudo TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabelas do fórum criadas ou verificadas com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar tabelas do fórum:', error);
    throw error;
  }
};

export default syncTables;