import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const loginService = async (email) => {
  return await User.findByEmail(email);
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.SECRET_JWT, { expiresIn: 86400 });

export { loginService, generateToken };