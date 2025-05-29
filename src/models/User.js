import pool from '../database/config.js';

// Modelo User
const User = {
  async create({ nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, ativo }) {
    const query = `
      INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, created_at, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)
      RETURNING *;
    `;
    const values = [
      nome_usr,
      email_usr,
      pwd_usr,
      end_usr,
      cid_usr,
      est_usr,
      cat_usr || 0,
      niv_usr || 1,
      dtn_usr,
      img_usr,
      ativo !== undefined ? ativo : true
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async findById(id_usr) {
    const query = `
      SELECT *
      FROM dev_lab_usuarios
      WHERE id_usr = $1;
    `;
    const { rows } = await pool.query(query, [id_usr]);
    return rows[0];
  },

  async findByEmail(email_usr) {
    const query = `
      SELECT *
      FROM dev_lab_usuarios
      WHERE email_usr = $1;
    `;
    const { rows } = await pool.query(query, [email_usr]);
    return rows[0];
  },

  async update(id_usr, { nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, ativo }) {
    const query = `
      UPDATE dev_lab_usuarios
      SET nome_usr = $1, email_usr = $2, pwd_usr = $3, end_usr = $4, cid_usr = $5, est_usr = $6,
          cat_usr = $7, niv_usr = $8, dtn_usr = $9, img_usr = $10, ativo = $11
      WHERE id_usr = $12
      RETURNING *;
    `;
    const values = [
      nome_usr,
      email_usr,
      pwd_usr,
      end_usr,
      cid_usr,
      est_usr,
      cat_usr,
      niv_usr,
      dtn_usr,
      img_usr,
      ativo,
      id_usr
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id_usr) {
    const query = `
      DELETE FROM dev_lab_usuarios
      WHERE id_usr = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_usr]);
    return rows[0];
  }
};

export default User;

// import { Pool } from 'pg';
// import dbConfig from '../database/config.js';

// // Conexão com o banco usando pg
// const pool = new Pool(dbConfig);

// // Modelo User
// const User = {
//   // Criar um novo usuário
//   async create({ nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, ativo }) {
//     const query = `
//       INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, created_at, ativo)
//       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, $11)
//       RETURNING *;
//     `;
//     const values = [
//       nome_usr,
//       email_usr,
//       pwd_usr,
//       end_usr,
//       cid_usr,
//       est_usr,
//       cat_usr || 0,
//       niv_usr || 1,
//       dtn_usr,
//       img_usr,
//       ativo !== undefined ? ativo : true
//     ];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   // Buscar usuário por id
//   async findById(id_usr) {
//     const query = `
//       SELECT *
//       FROM dev_lab_usuarios
//       WHERE id_usr = $1;
//     `;
//     const { rows } = await pool.query(query, [id_usr]);
//     return rows[0];
//   },

//   // Buscar usuário por email
//   async findByEmail(email_usr) {
//     const query = `
//       SELECT *
//       FROM dev_lab_usuarios
//       WHERE email_usr = $1;
//     `;
//     const { rows } = await pool.query(query, [email_usr]);
//     return rows[0];
//   },

//   // Atualizar usuário
//   async update(id_usr, { nome_usr, email_usr, pwd_usr, end_usr, cid_usr, est_usr, cat_usr, niv_usr, dtn_usr, img_usr, ativo }) {
//     const query = `
//       UPDATE dev_lab_usuarios
//       SET nome_usr = $1, email_usr = $2, pwd_usr = $3, end_usr = $4, cid_usr = $5, est_usr = $6,
//           cat_usr = $7, niv_usr = $8, dtn_usr = $9, img_usr = $10, ativo = $11
//       WHERE id_usr = $12
//       RETURNING *;
//     `;
//     const values = [
//       nome_usr,
//       email_usr,
//       pwd_usr,
//       end_usr,
//       cid_usr,
//       est_usr,
//       cat_usr,
//       niv_usr,
//       dtn_usr,
//       img_usr,
//       ativo,
//       id_usr
//     ];
//     const { rows } = await pool.query(query, values);
//     return rows[0];
//   },

//   // Deletar usuário
//   async delete(id_usr) {
//     const query = `
//       DELETE FROM dev_lab_usuarios
//       WHERE id_usr = $1
//       RETURNING *;
//     `;
//     const { rows } = await pool.query(query, [id_usr]);
//     return rows[0];
//   }
// };

// export default User;