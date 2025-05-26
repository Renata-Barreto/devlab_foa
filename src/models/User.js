import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../database/config.js';

const User = sequelize.define('User', {
  id_usr: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nome_usr: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email_usr: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
  },
  pwd_usr: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  end_usr: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  cid_usr: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  est_usr: {
    type: DataTypes.CHAR(2),
    allowNull: true,
  },
  cat_usr: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 0,
  },
  niv_usr: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    defaultValue: 1,
  },
  dtn_usr: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  img_usr: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'dev_lab_usuarios',
  timestamps: false,
});

export default User;