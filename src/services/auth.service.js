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
    throw error; // Propaga o erro para ser tratado no controlador
  }
};

const generateToken = (id) => {
  try {
    if (!process.env.SECRET_JWT) {
      console.error('Erro: SECRET_JWT não está definido');
      throw new Error('Chave secreta para JWT não configurada');
    }
    const token = jwt.sign({ id }, process.env.SECRET_JWT, { expiresIn: 86400 });
    return token;
  } catch (error) {
    console.error('Erro ao gerar token JWT:', error.message);
    throw error;
  }
};

export { loginService, generateToken }; //

// import User from '../models/User.js';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// const loginService = async (email) => {
//   return await User.findByEmail(email);
// };

// const generateToken = (id) =>
//   jwt.sign({ id }, process.env.SECRET_JWT, { expiresIn: 86400 });

// export { loginService, generateToken };