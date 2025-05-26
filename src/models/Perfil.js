import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../database/config.js';
import User from './User.js';

const Perfil = sequelize.define('Perfil', {
  id_pfl: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usr: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id_usr',
    },
  },
  des_pfl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  prf_pfl: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'dev_lab_perfil',
  timestamps: false,
});

Perfil.belongsTo(User, { foreignKey: 'id_usr' });
User.hasOne(Perfil, { foreignKey: 'id_usr' });

export default Perfil;