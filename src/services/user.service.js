// src/services/user.service.js
import pool from '../database/config.js';
import bcrypt from 'bcrypt';

const userService = {
  createService: async ({ name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr }) => {
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const query = `
        INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, img_usr, end_usr, cid_usr, est_usr, dtn_usr, ativo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        RETURNING id_usr, nome_usr, email_usr, img_usr, cat_usr
      `;
      const values = [name, email, hashedPassword, avatar, end_usr, cid_usr, est_usr, dtn_usr];
      const { rows } = await pool.query(query, values);
      console.log(`Usuário criado: ID ${rows[0].id_usr}`);
      return rows[0];
    } catch (err) {
      console.error('Erro ao criar usuário:', err.message);
      throw err;
    }
  },

  findByEmailService: async (email) => {
    try {
      const query = `
        SELECT u.*, p.des_pfl, p.prf_pfl
        FROM dev_lab_usuarios u
        LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
        WHERE u.email_usr = $1 AND u.ativo = TRUE
      `;
      const { rows } = await pool.query(query, [email]);
      return rows[0] || null;
    } catch (err) {
      console.error('Erro ao buscar usuário por email:', err.message);
      throw err;
    }
  },

  findByIdService: async (id) => {
    try {
      console.log(`Buscando usuário com id_usr: ${id}`);
      const query = `
        SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, u.end_usr, u.cid_usr, u.est_usr, u.dtn_usr, u.ativo, p.des_pfl, p.prf_pfl
        FROM dev_lab_usuarios u
        LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
        WHERE u.id_usr = $1 AND u.ativo = TRUE
      `;
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null;
    } catch (err) {
      console.error('Erro ao buscar usuário por ID:', err.message);
      throw err;
    }
  },

  findAllService: async () => {
    try {
      const query = `
        SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, p.* 
        FROM dev_lab_perfil p 
        RIGHT JOIN dev_lab_usuarios u ON p.id_usr = u.id_usr
        WHERE u.ativo = TRUE
      `;
      const { rows } = await pool.query(query);
      return rows;
    } catch (err) {
      console.error('Erro ao buscar todos os usuários:', err.message);
      throw err;
    }
  },

  updateService: async (id, avatar, bio, fotoPath) => {
    try {
      const updates = [];
      const values = [];
      let index = 1;

      if (fotoPath) {
        updates.push(`img_usr = $${index++}`);
        values.push(fotoPath);
      } else if (avatar) {
        updates.push(`img_usr = $${index++}`);
        values.push(avatar);
      }

      let user = null;
      if (updates.length > 0) {
        const query = `
          UPDATE dev_lab_usuarios
          SET ${updates.join(', ')}
          WHERE id_usr = $${index}
          RETURNING id_usr, nome_usr, email_usr, img_usr, cat_usr;
        `;
        values.push(id);
        const { rows } = await pool.query(query, values);
        user = rows[0];
      } else {
        user = await userService.findByIdService(id);
      }

      if (!user) return null;

      const perfilQuery = await pool.query('SELECT * FROM dev_lab_perfil WHERE id_usr = $1', [id]);
      let perfil = perfilQuery.rows[0];

      if (!perfil && (bio || fotoPath || avatar)) {
        const insertQuery = `
          INSERT INTO dev_lab_perfil (id_usr, des_pfl, prf_pfl)
          VALUES ($1, $2, $3)
          RETURNING id_pfl, id_usr, des_pfl, prf_pfl;
        `;
        const perfilValues = [id, bio || null, fotoPath ? fotoPath : avatar];
        const { rows } = await pool.query(insertQuery, perfilValues);
        perfil = rows[0];
      } else if (perfil && (bio !== undefined || fotoPath || avatar)) {
        const perfilUpdates = [];
        const perfilValues = [];
        let perfilIndex = 1;

        if (bio !== undefined) {
          perfilUpdates.push(`des_pfl = $${perfilIndex++}`);
          perfilValues.push(bio);
        }
        if (fotoPath || avatar) {
          perfilUpdates.push(`prf_pfl = $${perfilIndex++}`);
          perfilValues.push(fotoPath || avatar);
        }

        if (perfilUpdates.length > 0) {
          perfilValues.push(perfil.id_pfl);
          const perfilQuery = `
            UPDATE dev_lab_perfil
            SET ${perfilUpdates.join(', ')}
            WHERE id_pfl = $${perfilIndex}
            RETURNING id_pfl, id_usr, des_pfl, prf_pfl;
          `;
          const { rows } = await pool.query(perfilQuery, perfilValues);
          perfil = rows[0];
        }
      }

      return { ...user, ...(perfil ? { des_pfl: perfil.des_pfl, prf_pfl: perfil.prf_pfl } : {}) };
    } catch (err) {
      console.error('Erro ao atualizar usuário:', err.message);
      throw err;
    }
  },

  deleteService: async (id) => {
    try {
      const query = `
        UPDATE dev_lab_usuarios
        SET ativo = FALSE
        WHERE id_usr = $1 AND ativo = TRUE
        RETURNING id_usr, nome_usr, email_usr, img_usr
      `;
      const { rows } = await pool.query(query, [id]);
      console.log(`Usuário ID ${id} desativado`);
      return rows[0] || null;
    } catch (err) {
      console.error('Erro ao desativação do usuário:', err.message);
      throw err;
    }
  },

  deleteService1: async (id) => {
    try {
      await pool.query('DELETE FROM dev_lab_perfil WHERE id_usr = $1', [id]);
      const query = `
        DELETE FROM dev_lab_usuarios
        WHERE id_usr = $1
        RETURNING id_usr, nome_usr, email_usr, img_usr;
      `;
      const { rows } = await pool.query(query, [id]);
      console.log(`Usuário ID ${id} deletado completamente`);
      return rows[0] || null;
    } catch (err) {
      console.error('Erro ao deletar usuário:', err.message);
      throw err;
    }
  },
};

export default userService;