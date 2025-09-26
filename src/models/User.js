import pool from '../database/config.js';

const User = {
  create: async (values) => {
    const query = `
      INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, img_usr, end_usr, cid_usr, est_usr, dtn_usr, ativo)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING id_usr, nome_usr, email_usr, img_usr, cat_usr
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  findByEmail: async (email) => {
    const query = `
      SELECT u.*, p.des_pfl, p.prf_pfl
      FROM dev_lab_usuarios u
      LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
      WHERE u.email_usr = $1 AND u.ativo = TRUE
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  },

  findById: async (id) => {
    const query = `
      SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, u.end_usr, u.cid_usr, u.est_usr, u.dtn_usr, u.ativo, 
             p.des_pfl, p.prf_pfl
      FROM dev_lab_usuarios u
      LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
      WHERE u.id_usr = $1 AND u.ativo = TRUE
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  findAll: async () => {
    const query = `
      SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, p.* 
      FROM dev_lab_perfil p 
      RIGHT JOIN dev_lab_usuarios u ON p.id_usr = u.id_usr
      WHERE u.ativo = TRUE
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  updateUser: async (id, updates, values) => {
    const query = `
      UPDATE dev_lab_usuarios
      SET ${updates.join(', ')}
      WHERE id_usr = $${values.length}
      RETURNING id_usr, nome_usr, email_usr, img_usr, cat_usr
    `;
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  updateProfile: async (id_usr, des_pfl, img_usr) => {
    const query = `
      UPDATE dev_lab_perfil
      SET des_pfl = $1, img_usr = $2
      WHERE id_usr = $3
      RETURNING id_pfl, id_usr, des_pfl, img_usr;
    `;
    const { rows } = await pool.query(query, [des_pfl, img_usr, id_usr]);
    return rows[0];
  },

  insertProfile: async (id_usr, des_pfl, prf_pfl) => {
    const query = `
      INSERT INTO dev_lab_perfil (id_usr, des_pfl, prf_pfl)
      VALUES ($1, $2, $3)
      RETURNING id_pfl, id_usr, des_pfl, prf_pfl;
    `;
    const { rows } = await pool.query(query, [id_usr, des_pfl, prf_pfl]);
    return rows[0];
  },

  delete: async (id) => {
    const query = `
      UPDATE dev_lab_usuarios
      SET ativo = FALSE
      WHERE id_usr = $1 AND ativo = TRUE
      RETURNING id_usr, nome_usr, email_usr, img_usr
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  },

  hardDelete: async (id) => {
    await pool.query('DELETE FROM dev_lab_perfil WHERE id_usr = $1', [id]);
    const query = `
      DELETE FROM dev_lab_usuarios
      WHERE id_usr = $1
      RETURNING id_usr, nome_usr, email_usr, img_usr;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
};

export default User;
