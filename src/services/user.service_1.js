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