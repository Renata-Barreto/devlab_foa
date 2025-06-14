import pool from '../database/config.js';

class Tag {
  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM tags');
    return rows;
  }

  static async create(nome) {
    const { rows } = await pool.query(
      'INSERT INTO tags (nome) VALUES ($1) ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING *',
      [nome]
    );
    return rows[0];
  }
}

export default Tag;