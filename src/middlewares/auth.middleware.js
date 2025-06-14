// src/middlewares/auth.middleware.js
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service.js';

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    console.log('Cabeçalho de autorização recebido:', authorization);

    if (!authorization) {
      console.log('Erro: Cabeçalho de autorização ausente', { path: req.path });
      return res.status(401).json({ message: 'Não autorizado: Cabeçalho de autorização ausente' });
    }

    const parts = authorization.split(' ');
    if (parts.length !== 2) {
      console.log('Erro: Formato de autorização inválido', { authorization, path: req.path });
      return res.status(401).json({ message: 'Não autorizado: Formato de autorização inválido' });
    }

    const [schema, token] = parts;
    if (schema !== 'Bearer') {
      console.log('Erro: Esquema de autorização não é Bearer', { schema, path: req.path });
      return res.status(401).json({ message: 'Não autorizado: Esquema inválido' });
    }

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_aqui', (error, decoded) => {
        if (error) {
          console.log('Erro ao verificar token:', { error: error.message, token, path: req.path });
          reject(`Token inválido: ${error.message}`);
        } else {
          console.log('Token decodificado:', { id: decoded.id, path: req.path });
          resolve(decoded);
        }
      });
    });

    const user = await userService.findByIdService(decoded.id);
    if (!user || !user.id_usr) {
      console.log(`Erro: Usuário com id_usr ${decoded.id} não encontrado`, { path: req.path });
      return res.status(401).json({ message: 'Token inválido: Usuário não encontrado' });
    }

    if (!user.ativo) {
      console.log(`Erro: Usuário com id_usr ${decoded.id} está inativo`, { path: req.path });
      return res.status(401).json({ message: 'Usuário inativo' });
    }

    req.user = { ...user, id_usr: user.id_usr };
    console.log(`Usuário autenticado: id_usr ${req.user.id_usr}`, { path: req.path });
    next();
  } catch (err) {
    console.error('Erro no authMiddleware:', { error: err.message, path: req.path });
    res.status(401).json({ message: err.message || 'Erro de autenticação' });
  }
};

export default authMiddleware;

// // src/middlewares/auth.middleware.js <- ATENÇÃO!!! FUNCIONANDO! RETORNAR COM ELE SE O ACIMA DER RUIM
// import dotenv from 'dotenv';
// import jwt from 'jsonwebtoken';
// import userService from '../services/user.service.js';

// dotenv.config();

// export const authMiddleware = async (req, res, next) => {
//   try {
//     const { authorization } = req.headers;

//     if (!authorization) {
//       console.log('Erro: Cabeçalho de autorização ausente', { path: req.path });
//       return res.status(401).json({ message: 'Não autorizado: Cabeçalho de autorização ausente' });
//     }

//     const parts = authorization.split(' ');
//     if (parts.length !== 2) {
//       console.log('Erro: Formato de autorização inválido', { authorization, path: req.path });
//       return res.status(401).json({ message: 'Não autorizado: Formato de autorização inválido' });
//     }

//     const [schema, token] = parts;
//     if (schema !== 'Bearer') {
//       console.log('Erro: Esquema de autorização não é Bearer', { schema, path: req.path });
//       return res.status(401).json({ message: 'Não autorizado: Esquema inválido' });
//     }

//     const decoded = await new Promise((resolve, reject) => {
//       jwt.verify(token, process.env.SECRET_JWT, (error, decoded) => {
//         if (error) {
//           console.log('Erro ao verificar token:', { error: error.message, path: req.path });
//           reject(`Token inválido: ${error.message}`);
//         } else {
//           console.log('Token decodificado:', { id: decoded.id, path: req.path });
//           resolve(decoded);
//         }
//       });
//     });

//     const user = await userService.findByIdService(decoded.id);
//     if (!user || !user.id_usr) {
//       console.log(`Erro: Usuário com id_usr ${decoded.id} não encontrado`, { path: req.path });
//       return res.status(401).json({ message: 'Token inválido: Usuário não encontrado' });
//     }

//     if (!user.ativo) {
//       console.log(`Erro: Usuário com id_usr ${decoded.id} está inativo`, { path: req.path });
//       return res.status(401).json({ message: 'Usuário inativo' });
//     }

//     req.user = { ...user, id_usr: user.id_usr };
//     console.log(`Usuário autenticado: id_usr ${req.user.id_usr}`, { path: req.path });
//     next();
//   } catch (err) {
//     console.error('Erro no authMiddleware:', { error: err.message, path: req.path });
//     res.status(401).json({ message: err.message || 'Erro de autenticação' });
//   }
// };

// export default authMiddleware;

