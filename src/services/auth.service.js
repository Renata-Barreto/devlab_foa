import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const loginService = async (email) => {
  return await User.findOne({ where: { email_usr: email } });
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.SECRET_JWT, { expiresIn: 86400 });

export { loginService, generateToken };