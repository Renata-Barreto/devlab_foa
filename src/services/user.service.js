import bcrypt from 'bcrypt';
import User from '../models/User.js';

const UserService = {
  create: async ({ name, email, password, avatar, end_usr, cid_usr, est_usr, dtn_usr }) => {
    const exists = await User.findByEmail(email);
    if (exists) throw new Error('E-mail já cadastrado');

    const hashedPassword = bcrypt.hashSync(password, 10);
    const values = [name, email, hashedPassword, avatar, end_usr, cid_usr, est_usr, dtn_usr];
    return await User.create(values);
  },

  findByEmail: async (email) => {
    return await User.findByEmail(email);
  },

  findById: async (id) => {
    return await User.findById(id);
  },

  findAll: async () => {
    return await User.findAll();
  },

  update: async (id, bio, fotoPath) => {
    const user = await User.updateProfile(id, fotoPath ? { img_usr: fotoPath } : {});
    if (!user) return null;
    return { ...user, ...(bio ? { des_pfl: bio } : {}) };
  },

  deactivate: async (id) => {
    return await User.deactivate(id);
  },

  delete: async (id) => {
    return await User.delete(id);
  }
};

export default UserService;
