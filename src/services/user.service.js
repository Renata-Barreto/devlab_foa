import User from '../models/User.js';
import Perfil from '../models/Perfil.js';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createService = async (body) => {
  const hashedPassword = bcrypt.hashSync(body.password, 10);

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
  return await User.findOne({ where: { email_usr: email } });
};

const findAllService = async () => {
  return await User.findAll();
};

const findByIdService = async (id) => {
  return await User.findByPk(id, {
    include: [{ model: Perfil, attributes: ['des_pfl', 'prf_pfl'] }],
  });
};

const updateService = async (id, avatar, bio, fotoPath) => {
  const user = await User.findByPk(id);
  if (!user) return null;

  let perfil = await Perfil.findOne({ where: { id_usr: id } });
  if (!perfil) {
    perfil = await Perfil.create({
      id_usr: id,
      des_pfl: bio || null,
      prf_pfl: fotoPath || avatar || null,
    });
  } else {
    if (bio !== undefined) perfil.des_pfl = bio;
    if (fotoPath) perfil.prf_pfl = fotoPath;
    else if (avatar) perfil.prf_pfl = avatar;
    await perfil.save();
  }

  if (fotoPath) {
    user.img_usr = fotoPath;
  } else if (avatar) {
    user.img_usr = avatar;
  }
  await user.save();

  return user;
};

const deleteService = async (id) => {
  const user = await User.findByPk(id);

  if (user) {
    user.ativo = false;
    await user.save();
    return user;
  }

  return null;
};

const deleteService1 = async (id) => {
  const user = await User.findByPk(id);

  if (user) {
    await user.destroy();
    return user;
  }

  return null;
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

// const createService = async (body) => {
//   const hashedPassword = bcrypt.hashSync(body.password, 10);

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
//   return await User.findOne({ where: { email_usr: email } });
// };

// const findAllService = async () => {
//   return await User.findAll();
// };

// const findByIdService = async (id) => {
//   return await User.findByPk(id, {
//     include: [{ model: Perfil, attributes: ['des_pfl', 'prf_pfl'] }],
//   });
// };

// const updateService = async (id, avatar, bio) => {
//   const user = await User.findByPk(id);
//   if (!user) return null;

//   // Atualizar o perfil na tabela dev_lab_perfil
//   let perfil = await Perfil.findOne({ where: { id_usr: id } });
//   if (!perfil) {
//     // Se o perfil não existe, criar um novo
//     perfil = await Perfil.create({
//       id_usr: id,
//       des_pfl: bio || null,
//       prf_pfl: avatar || null,
//     });
//   } else {
//     // Atualizar o perfil existente
//     if (bio !== undefined) perfil.des_pfl = bio;
//     if (avatar) perfil.prf_pfl = avatar;
//     await perfil.save();
//   }

//   // Atualizar img_usr na tabela dev_lab_usuarios, se necessário
//   if (avatar) {
//     user.img_usr = avatar;
//     await user.save();
//   }

//   return user;
// };

// const deleteService = async (id) => {
//   const user = await User.findByPk(id);

//   if (user) {
//     user.ativo = false;
//     await user.save();
//     return user;
//   }

//   return null;
// };

// const deleteService1 = async (id) => {
//   const user = await User.findByPk(id);

//   if (user) {
//     await user.destroy();
//     return user;
//   }

//   return null;
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

// import User from '../models/User.js';
// import bcrypt from 'bcrypt';

// const createService = async (body) => {
//   const hashedPassword = bcrypt.hashSync(body.password, 10);

//   const newUser = await User.create({
//     nome_usr: body.name,
//     email_usr: body.email,
//     pwd_usr: hashedPassword,
//     end_usr: body.end_usr || null,
//     cid_usr: body.cid_usr || null,
//     est_usr: body.est_usr || null,
//     cat_usr: body.email.endsWith('@admin.com') ? 1 : 0, // Define como admin ou aluno
//     niv_usr: 1,
//     dtn_usr: body.dtn_usr || null,
//     img_usr: body.avatar || null,
//     ativo: true,
//   });

//   return newUser;
// };

// const findByEmailService = async (email) => {
//   return await User.findOne({ where: { email_usr: email } });
// };

// const findAllService = async () => {
//   return await User.findAll();
// };

// const findByIdService = async (id) => {
//   return await User.findByPk(id);
// };

// const updateService = async (id, avatar, background, bio) => {
//   const user = await User.findByPk(id);

//   if (user) {
//     if (avatar) user.img_usr = avatar;
//     if (background) user.background = background; // Adicione a coluna background se necessário
//     if (bio) user.des_pfl = bio; // Usa des_pfl da tabela dev_lab_perfil (pode precisar de ajustes)

//     await user.save();
//     return user;
//   }

//   return null;
// };

// const deleteService = async (id) => {
//   const user = await User.findByPk(id);

//   if (user) {
//     user.ativo = false;
//     await user.save();
//     return user;
//   }

//   return null;
// };

// const deleteService1 = async (id) => {
//   const user = await User.findByPk(id);

//   if (user) {
//     await user.destroy();
//     return user;
//   }

//   return null;
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