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

//-> caso o de cima não funcione, testar esse.

// // src/models/Categoria.js
// import pool from '../database/config.js';

// class Categoria {
//   static async findAll() {
//     try {
//       const { rows } = await pool.query('SELECT id, nome FROM categorias ORDER BY nome');
//       return rows;
//     } catch (error) {
//       console.error('Erro em Categoria.findAll:', error);
//       throw error;
//     }
//   }
// }

// export default Categoria;