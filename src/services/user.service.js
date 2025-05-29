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

export default userService;

// import User from '../models/User.js';
// import Perfil from '../models/Perfil.js';
// import bcrypt from 'bcrypt';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { Pool } from 'pg';
// import dbConfig from '../database/config.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Criar o pool de conexão
// const pool = new Pool(dbConfig);

// const createService = async (body) => {
//   const hashedPassword = await bcrypt.hash(body.password, 10);

//   const newUser = await User.create({
//     nome_usr: body.name,
//     email_usr: body.email,
//     pwd_usr: hashedPassword,
//     end_usr: body.end_usr || null,
//     cid_usr: body.cid_usr || null,
//     est_usr: body.est_usr || null,
//     cat_usr: body.email.endsWith('@admin.com') ? 1 : 0,
//     niv_usr: 1,
//     dtn_usr: body.dtn_usr || null,
//     img_usr: body.avatar || null,
//     ativo: true,
//   });

//   return newUser;
// };

// const findByEmailService = async (email) => {
//   return await User.findByEmail(email);
// };

// const findAllService = async () => {
//   const query = `SELECT * FROM dev_lab_usuarios WHERE ativo = true`;
//   const { rows } = await pool.query(query);
//   return rows;
// };

// const findByIdService = async (id) => {
//   const query = `
//     SELECT u.*, p.des_pfl, p.prf_pfl
//     FROM dev_lab_usuarios u
//     LEFT JOIN dev_lab_perfil p ON u.id_usr = p.id_usr
//     WHERE u.id_usr = $1
//   `;
//   const { rows } = await pool.query(query, [id]);
//   return rows[0];
// };

// const updateService = async (id, avatar, bio, fotoPath) => {
//   let user = await User.findById(id); // Corrigido para `let`
//   if (!user) return null;

//   const updates = [];
//   const values = [];
//   let index = 1;

//   if (fotoPath) {
//     updates.push(`img_usr = $${index++}`);
//     values.push(fotoPath);
//   } else if (avatar) {
//     updates.push(`img_usr = $${index++}`);
//     values.push(avatar);
//   }

//   if (updates.length > 0) {
//     const query = `UPDATE dev_lab_usuarios SET ${updates.join(', ')} WHERE id_usr = $${index} RETURNING *`;
//     values.push(id);
//     const { rows } = await pool.query(query, values);
//     user = rows[0]; // Agora válido
//   }
//   let perfil = await Perfil.findByUserId(id);
//   if (!perfil && (bio || fotoPath || avatar)) {
//     perfil = await Perfil.create({
//       id_usr: id,
//       des_pfl: bio || null,
//       prf_pfl: fotoPath || avatar || null,
//     });
//   } else if (perfil && (bio !== undefined || fotoPath || avatar)) {
//     const perfilUpdates = [];
//     const perfilValues = [];
//     let perfilIndex = 1;

//     if (bio !== undefined) {
//       perfilUpdates.push(`des_pfl = $${perfilIndex++}`);
//       perfilValues.push(bio);
//     }
//     if (fotoPath || avatar) {
//       perfilUpdates.push(`prf_pfl = $${perfilIndex++}`);
//       perfilValues.push(fotoPath || avatar);
//     }

//     if (perfilUpdates.length > 0) {
//       perfilValues.push(perfil.id_pfl);
//       const perfilQuery = `UPDATE dev_lab_perfil SET ${perfilUpdates.join(', ')} WHERE id_pfl = $${perfilIndex} RETURNING *`;
//       const { rows } = await pool.query(perfilQuery, perfilValues);
//       perfil = rows[0];
//     }
//   }

//   return user;
// };

// const deleteService = async (id) => {
//   const user = await User.findById(id);
//   if (!user) return null;

//   const query = `UPDATE dev_lab_usuarios SET ativo = false WHERE id_usr = $1 RETURNING *`;
//   const { rows } = await pool.query(query, [id]);
//   return rows[0];
// };

// const deleteService1 = async (id) => {
//   const user = await User.findById(id);
//   if (!user) return null;

//   await Perfil.delete(id);
//   await User.delete(id);
//   return user;
// };

// const userService = {
//   createService,
//   findAllService,
//   findByIdService,
//   updateService,
//   findByEmailService,
//   deleteService,
//   deleteService1,
// };

// export default userService;