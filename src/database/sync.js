import sequelize from './config.js';
import User from '../models/User.js';

const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');
    // Não usamos sequelize.sync() porque o schema já foi criado via SQL
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
  }
};

export default syncDatabase;