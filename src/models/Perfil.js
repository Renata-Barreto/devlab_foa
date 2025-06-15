// src/models/Perfil.js
import pool from '../database/config.js';

// Modelo Perfil
const Perfil = {
  // Criar um novo perfil
  async create({ id_usr, des_pfl, prf_pfl }) {
    const query = `
      INSERT INTO dev_lab_perfil (id_usr, des_pfl, prf_pfl)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [id_usr, des_pfl, prf_pfl];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Buscar perfil por id
  async findById(id_pfl) {
    const query = `
      SELECT p.*, u.*
      FROM dev_lab_perfil p
      JOIN dev_lab_usuarios u ON p.id_usr = u.id_usr
      WHERE p.id_pfl = $1;
    `;
    const { rows } = await pool.query(query, [id_pfl]);
    return rows[0];
  },

  // Buscar perfil por id_usr
  async findByUserId(id_usr) {
    const query = `
      SELECT p.*, u.*
      FROM dev_lab_perfil p
      JOIN dev_lab_usuarios u ON p.id_usr = u.id_usr
      WHERE p.id_usr = $1;
    `;
    const { rows } = await pool.query(query, [id_usr]);
    return rows[0];
  },

  // Atualizar perfil
  async update(id_pfl, { des_pfl, prf_pfl }) {
    const query = `
      UPDATE dev_lab_perfil
      SET des_pfl = $1, prf_pfl = $2
      WHERE id_pfl = $3
      RETURNING *;
    `;
    const values = [des_pfl, prf_pfl, id_pfl];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Deletar perfil
  async delete(id_pfl) {
    const query = `
      DELETE FROM dev_lab_perfil
      WHERE id_pfl = $1
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [id_pfl]);
    return rows[0];
  }
};

export default Perfil; //