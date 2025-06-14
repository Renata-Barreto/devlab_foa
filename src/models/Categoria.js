import pool from '../database/config.js';

class Categoria {
  static async findAll() {
    const { rows } = await pool.query('SELECT * FROM categorias');
    return rows;
  }

  static async create(nome) {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nome) VALUES ($1) RETURNING *',
      [nome]
    );
    return rows[0];
  }
}

export default Categoria;