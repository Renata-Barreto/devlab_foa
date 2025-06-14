// // src/services/user.service.js
// import { pool } from '../database/config.js';
// import bcrypt from 'bcrypt';

// const userService = {
//   createService: async ({ name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr }) => {
//     try {
//       const hashedPassword = bcrypt.hashSync(password, 10);
//       const query = `
//         INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, img_usr, end_usr, cid_usr, est_usr, dtn_usr, ativo)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
//         RETURNING id_usr, nome_usr, email_usr, img_usr, cat_usr
//       `;
//       const values = [name, email, hashedPassword, avatar, end_usr, cid_usr, est_usr, dtn_usr];
//       const { rows } = await pool.query(query, values);
//       console.log(`Usuário criado: ID ${rows[0].id_usr}`);
//       return rows[0];
//     } catch (err) {
//       console.error('Erro ao criar usuário:', err.message);
//       throw err;
//     }
//   },

//   findByEmailService: async (email) => {
//     try {
//       const query = `
//         SELECT u.*, p.des_pfl, p.prf_pfl
//         FROM dev_lab_usuarios u
//         LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
//         WHERE u.email_usr = $1 AND u.ativo = TRUE
//       `;
//       const { rows } = await pool.query(query, [email]);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao buscar usuário por email:', err.message);
//       throw err;
//     }
//   },

//   findByIdService: async (id) => {
//     try {
//       console.log(`Buscando usuário com id_usr: ${id}`);
//       const query = `
//         SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, u.end_usr, u.cid_usr, u.est_usr, u.dtn_usr, u.ativo, p.des_pfl, p.prf_pfl
//         FROM dev_lab_usuarios u
//         LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
//         WHERE u.id_usr = $1 AND u.ativo = TRUE
//       `;
//       const { rows } = await pool.query(query, [id]);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao buscar usuário por ID:', err.message);
//       throw err;
//     }
//   },

//   findAllService: async () => {
//     try {
//       const query = `
//         SELECT u.id_usr, u.nome_usr, u.email_usr, u.img_usr, u.cat_usr, p.* FROM dev_lab_perfil p RIGHT JOIN dev_lab_usuarios u ON p.id_usr = u.id_usr
//         WHERE u.ativo = TRUE
//       `;
//       const { rows } = await pool.query(query);
//       return rows;
//     } catch (err) {
//       console.error('Erro ao buscar todos os usuários:', err.message);
//       throw err;
//     }
//   },

//   updateService: async (id, avatar, bio, fotoPath) => {
//     try {
//       const updates = [];
//       const values = [];
//       let index = 1;

//       if (foto) {
//         updates.push(`img_usr = $${index++}`);
//         values.push(fotoPath);
//       } else if (avatar) {
//         updates.push(`img = $${index++}`);
//         values.push(avatar);
//       }

//       let user = null;
//       if (updates.length > 0) {
//         const query = `
//           UPDATE dev_lab_usuarios
//           SET ${updates.join(', ')}
//           WHERE id = $${index}
//           RETURNING id_usr, nome_usr, email, img, cat;
//         `;
//         values.push(id);
//         const { rows } = await pool.query(query, values);
//         user = rows[0];
//       } else {
//         user = await this.findById(id);
//       }

//       if (!user) return null;

//       const perfilQuery = await pool.query('SELECT * FROM dev_lab_perfil WHERE id_usr = $1', [id]);
//       let perfil = perfilQuery.rows[0];

//       if (!perfil && (bio || fotoPath || avatar)) {
//         const insertQuery = `
//           INSERT INTO dev_perfil (id, usuario, des_pfl, prf_pfl)
//           VALUES ($1, $2, $3, $3)
//           RETURNING id_pfl, id, usuario, des_pfl, prf_pfl;
//         `;
//         const perfilValues = [id, bio || null, foto || null ? fotoPath || avatar];
//         const { rows } = await pool.query(insertQuery, perfilValues);
//         perfil = rows[0];
//       } else if (perfil && (bio !== undefined || fotoPath || avatar)) {
//         const perfilUpdates = [];
//         const perfilValues = [];
//         let perfilIndex = 1;

//         if (bio !== undefined) {
//           perfilUpdates.push(`des_pfl = $${perfilIndex++}`);
//           perfilValues.push(bio);
//         }
//         if (foto || null || avatar) {
//           perfilUpdates.push(`prf_pfl = $${perfilIndex++}`);
//           perfilValues.push(foto || null ? avatar);
//         }

//         if (perfilUpdates.length > 0) {
//           perfilValues.push(perfil.id);
//           const perfilQuery = `
//             UPDATE dev_perfil
//             SET ${perfilUpdates.join(', ')}
//             WHERE id_pfl = $${perfilIndex}
//             RETURNING id_pfl, id_usr, des_pfl, prf_pfl;
//           `;
//           const { rows } = await pool.query(perfilQuery, perfilValues);
//           perfil = rows[0];
//         }
//       }

//       return { ...user, ...perfil ? { des_pfl: perfil.des_pfl, prf_pfl: perfil.pfl_pfl } : {}};
//     } catch (err) {
//       console.error('Erro ao atualizar usuário:', err.message);
//       throw err;
//     }
//   },

//   deleteService: async (id) => {
//     try {
//       const query = `
//         UPDATE dev_lab_usuarios
//         SET ativo = FALSE
//         WHERE id_usr = $1 AND ativo = TRUE
//         RETURNING id_usr, nome_usr, email_usr, img
//         `;
//       const { rows } = await pool.query(query, [id]);
//       console.log(`Usuário ID ${id} desativado`);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao desativação do usuário:', err.message);
//       throw err;
//     }
//   },

//   deleteService1: async (id) => {
//     try {
//       await pool.query('DELETE FROM dev_lab_perfil WHERE id = $1', [id]);
//       const query = `
//         DELETE FROM dev_lab_usuarios
//         WHERE id = $1
//         RETURNING id_usr, nome, email, img;
//         `;
//       const { rows } = await pool.query(query, [id]);
//       console.log(`Usuário ID ${id} deletado completamente`);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao deletar usuário:', err.message);
//       throw err;
//     }
//   },
// };

// export default userService;

// // src/services/user.service.js
// import pool from '../database/config.js';
// import bcrypt from 'bcrypt';

// const userService = {
//   createService: async ({ name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr }) => {
//     try {
//       const hashedPassword = bcrypt.hashSync(password, 10);
//       const query = `
//         INSERT INTO dev_lab_usuarios (nome_usr, email_usr, pwd_usr, img_usr, end_usr, cid_usr, est_usr, dtn_usr, ativo)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
//         RETURNING id_usr, nome_usr, email_usr, img_usr
//       `;
//       const values = [name, email, hashedPassword, avatar, end_usr, cid_usr, est_usr, dtn_usr];
//       const { rows } = await pool.query(query, values);
//       console.log(`Usuário criado: ID ${rows[0].id_usr}`);
//       return rows[0];
//     } catch (err) {
//       console.error('Erro ao criar usuário:', err.message);
//       throw err;
//     }
//   },

//   findByEmailService: async (email) => {
//     try {
//       const query = 'SELECT * FROM dev_lab_usuarios WHERE email_usr = $1';
//       const { rows } = await pool.query(query, [email]);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao buscar usuário por email:', err.message);
//       throw err;
//     }
//   },

//   findByIdService: async (id) => {
//     try {
//       console.log(`Buscando usuário com id_usr: ${id}`);
//       const query = `
//         SELECT id_usr, nome_usr, email_usr, img_usr, cat_usr, end_usr, cid_usr, est_usr, dtn_usr, ativo
//         FROM dev_lab_usuarios
//         WHERE id_usr = $1 AND ativo = TRUE
//       `;
//       const { rows } = await pool.query(query, [id]);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao buscar usuário por ID:', err.message);
//       throw err;
//     }
//   },

//   findAllService: async () => {
//     try {
//       const query = 'SELECT id_usr, nome_usr, email_usr, img_usr, cat_usr FROM dev_lab_usuarios WHERE ativo = TRUE';
//       const { rows } = await pool.query(query);
//       return rows;
//     } catch (err) {
//       console.error('Erro ao buscar todos os usuários:', err.message);
//       throw err;
//     }
//   },

//   updateService: async (id, avatar, bio, fotoPath) => {
//     try {
//       const updates = [];
//       const values = [];
//       let paramIndex = 1;

//       if (bio) {
//         updates.push(`des_pfl = $${paramIndex++}`);
//         values.push(bio);
//       }
//       if (avatar) {
//         updates.push(`img_usr = $${paramIndex++}`);
//         values.push(avatar);
//       }
//       if (fotoPath) {
//         updates.push(`img_usr = $${paramIndex++}`);
//         values.push(fotoPath);
//       }

//       if (updates.length === 0) return null;

//       values.push(id);
//       const query = `
//         UPDATE dev_lab_usuarios
//         SET ${updates.join(', ')}
//         WHERE id_usr = $${paramIndex} AND ativo = TRUE
//         RETURNING id_usr, nome_usr, email_usr, img_usr
//       `;
//       const { rows } = await pool.query(query, values);
//       console.log(`Usuário ID ${id} atualizado`);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao atualizar usuário:', err.message);
//       throw err;
//     }
//   },

//   deleteService: async (id) => {
//     try {
//       const query = `
//         UPDATE dev_lab_usuarios
//         SET ativo = FALSE
//         WHERE id_usr = $1 AND ativo = TRUE
//         RETURNING id_usr, nome_usr, email_usr, img_usr
//       `;
//       const { rows } = await pool.query(query, [id]);
//       console.log(`Usuário ID ${id} desativado`);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao desativar usuário:', err.message);
//       throw err;
//     }
//   },

//   deleteService1: async (id) => {
//     try {
//       const query = `
//         DELETE FROM dev_lab_usuarios
//         WHERE id_usr = $1
//         RETURNING id_usr, nome_usr, email_usr, img_usr
//       `;
//       const { rows } = await pool.query(query, [id]);
//       console.log(`Usuário ID ${id} deletado permanentemente`);
//       return rows[0] || null;
//     } catch (err) {
//       console.error('Erro ao deletar usuário:', err.message);
//       throw err;
//     }
//   },
// };

// export default userService;

import User from '../models/User.js';
import Perfil from '../models/Perfil.js';
import bcrypt from 'bcrypt';

const createService = async (body) => {
  const hashedPassword = await bcrypt.hash(body.password, 10);

  const newUser = await User.create({
    nome_usr: body.name,
    email_usr: body.email,
    pwd_usr: hashedPassword,
    end_usr: body.end_usr || null,
    cid_usr: body.cid_usr || null,
    est_usr: body.est_usr || null,
    cat_usr: body.email.endsWith('@admin.com') ? 1 : 0,
    niv_usr: 1,
    dtn_usr: body.dtn_usr || null,
    img_usr: body.avatar || null,
    ativo: true,
  });

  return newUser;
};

const findByEmailService = async (email) => {
  return await User.findByEmail(email);
};

const findAllService = async () => {
  return await User.findAll(); // Assumindo que você adicionará este método ao User.js
};

const findByIdService = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;

  const perfil = await Perfil.findByUserId(id);
  return {
    ...user,
    des_pfl: perfil?.des_pfl || null,
    prf_pfl: perfil?.prf_pfl || null,
  };
};

const updateService = async (id, avatar, bio, fotoPath) => {
  let user = await User.findById(id);
  if (!user) return null;

  const updates = {};
  if (fotoPath) updates.img_usr = fotoPath;
  else if (avatar) updates.img_usr = avatar;

  if (Object.keys(updates).length > 0) {
    user = await User.update(id, { ...user, ...updates });
  }

  let perfil = await Perfil.findByUserId(id);
  if (!perfil && (bio || fotoPath || avatar)) {
    perfil = await Perfil.create({
      id_usr: id,
      des_pfl: bio || null,
      prf_pfl: fotoPath || avatar || null,
    });
  } else if (perfil && (bio !== undefined || fotoPath || avatar)) {
    perfil = await Perfil.update(perfil.id_pfl, {
      des_pfl: bio !== undefined ? bio : perfil.des_pfl,
      prf_pfl: fotoPath || avatar || perfil.prf_pfl,
    });
  }

  return user;
};

const deleteService = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;

  return await User.update(id, { ...user, ativo: false });
};

const deleteService1 = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;

  const perfil = await Perfil.findByUserId(id);
  if (perfil) await Perfil.delete(perfil.id_pfl);
  await User.delete(id);
  return user;
};

const userService = {
  createService,
  findAllService,
  findByIdService,
  updateService,
  findByEmailService,
  deleteService,
  deleteService1,
};

export default userService; //

// // import User from '../models/User.js';
// // import Perfil from '../models/Perfil.js';
// // import bcrypt from 'bcrypt';
// // import path from 'path';
// // import { fileURLToPath } from 'url';
// // import { Pool } from 'pg';
// // import dbConfig from '../database/config.js';

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Criar o pool de conexão
// // const pool = new Pool(dbConfig);

// // const createService = async (body) => {
// //   const hashedPassword = await bcrypt.hash(body.password, 10);

// //   const newUser = await User.create({
// //     nome_usr: body.name,
// //     email_usr: body.email,
// //     pwd_usr: hashedPassword,
// //     end_usr: body.end_usr || null,
// //     cid_usr: body.cid_usr || null,
// //     est_usr: body.est_usr || null,
// //     cat_usr: body.email.endsWith('@admin.com') ? 1 : 0,
// //     niv_usr: 1,
// //     dtn_usr: body.dtn_usr || null,
// //     img_usr: body.avatar || null,
// //     ativo: true,
// //   });

// //   return newUser;
// // };

// // const findByEmailService = async (email) => {
// //   return await User.findByEmail(email);
// // };

// // const findAllService = async () => {
// //   const query = `SELECT * FROM dev_lab_usuarios WHERE ativo = true`;
// //   const { rows } = await pool.query(query);
// //   return rows;
// // };

// // const findByIdService = async (id) => {
// //   const query = `
// //     SELECT u.*, p.des_pfl, p.prf_pfl
// //     FROM dev_lab_usuarios u
// //     LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
// //     WHERE u.id_usr = $1
// //   `;
// //   const { rows } = await pool.query(query, [id]);
// //   return rows[0];
// // };

// // const updateService = async (id, avatar, bio, fotoPath) => {
// //   let user = await User.findById(id); // Corrigido para `let`
// //   if (!user) return null;

// //   const updates = [];
// //   const values = [];
// //   let index = 1;

// //   if (fotoPath) {
// //     updates.push(`img_usr = $${index++}`);
// //     values.push(fotoPath);
// //   } else if (avatar) {
// //     updates.push(`img_usr = $${index++}`);
// //     values.push(avatar);
// //   }

// //   if (updates.length > 0) {
// //     const query = `UPDATE dev_lab_usuarios SET ${updates.join(', ')} WHERE id_usr = $${index} RETURNING *`;
// //     values.push(id);
// //     const { rows } = await pool.query(query, values);
// //     user = rows[0]; // Agora válido
// //   }
// //   let perfil = await Perfil.findByUserId(id);
// //   if (!perfil && (bio || fotoPath || avatar)) {
// //     perfil = await Perfil.create({
// //       id_usr: id,
// //       des_pfl: bio || null,
// //       prf_pfl: fotoPath || avatar || null,
// //     });
// //   } else if (perfil && (bio !== undefined || fotoPath || avatar)) {
// //     const perfilUpdates = [];
// //     const perfilValues = [];
// //     let perfilIndex = 1;

// //     if (bio !== undefined) {
// //       perfilUpdates.push(`des_pfl = $${perfilIndex++}`);
// //       perfilValues.push(bio);
// //     }
// //     if (fotoPath || avatar) {
// //       perfilUpdates.push(`prf_pfl = $${perfilIndex++}`);
// //       perfilValues.push(fotoPath || avatar);
// //     }

// //     if (perfilUpdates.length > 0) {
// //       perfilValues.push(perfil.id_pfl);
// //       const perfilQuery = `UPDATE dev_lab_perfil SET ${perfilUpdates.join(', ')} WHERE id_pfl = $${perfilIndex} RETURNING *`;
// //       const { rows } = await pool.query(perfilQuery, perfilValues);
// //       perfil = rows[0];
// //     }
// //   }

// //   return user;
// // };

// // const deleteService = async (id) => {
// //   const user = await User.findById(id);
// //   if (!user) return null;

// //   const query = `UPDATE dev_lab_usuarios SET ativo = false WHERE id_usr = $1 RETURNING *`;
// //   const { rows } = await pool.query(query, [id]);
// //   return rows[0];
// // };

// // const deleteService1 = async (id) => {
// //   const user = await User.findById(id);
// //   if (!user) return null;

// //   await Perfil.delete(id);
// //   await User.delete(id);
// //   return user;
// // };

// // const userService = {
// //   createService,
// //   findAllService,
// //   findByIdService,
// //   updateService,
// //   findByEmailService,
// //   deleteService,
// //   deleteService1,
// // };

// // export default userService;