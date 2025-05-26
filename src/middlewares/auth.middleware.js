import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import userService from '../services/user.service.js';

dotenv.config();

export const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).send('Unauthorized');

    const parts = authorization.split(' ');
    if (parts.length !== 2) return res.status(401).send('Unauthorized');

    const [schema, token] = parts;

    if (schema !== 'Bearer') return res.status(401).send('Unauthorized');

    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.SECRET_JWT, (error, decoded) => {
        if (error) reject('Invalid Token');
        else resolve(decoded);
      });
    });

    const user = await userService.findByIdService(decoded.id);

    if (!user || !user.id_usr) return res.status(401).send('Invalid Token');

    if (!user.ativo) return res.status(401).send('User deleted');

    req.user = user;
    next();
  } catch (err) {
    res.status(500).send({ message: err.message || err });
  }
};

export default authMiddleware;