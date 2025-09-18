// src/services/auth.service.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const loginService = async (email) => {
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      console.log(`Usuário com e-mail ${email} não encontrado`);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário no loginService:', error.message);
    throw error;
  }
};

const generateToken = (id, nome_usr, email_usr, img_usr) => {
  try {
    const secret = process.env.JWT_SECRET || 'seu_segredo_aqui';
    if (!secret) {
      console.error('Erro: JWT_SECRET não está definido');
      throw new Error('Chave secreta para JWT não configurada');
    }
    console.log(`Gerando token para ID ${id}, nome: ${nome_usr}, email: ${email_usr}`);
    const token = jwt.sign(
      { id, nome_usr, email_usr, img_usr },
      secret,
      { expiresIn: '7d' } 
    );
    console.log('Token gerado:', token);
    return token;
  } catch (error) {
    console.error('Erro ao gerar token JWT:', error.message);
    throw error;
  }
};

export { loginService, generateToken };
