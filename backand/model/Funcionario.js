/**
 * Model Funcionario (RF 12 e 13)
 * Usuario interno da empresa. O login fica no Supabase Auth (auth_id).
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { PERFIS } = require('../config/constantes');

const Funcionario = sequelize.define('funcionarios', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  auth_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  nome: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  telefone: { type: DataTypes.STRING(20) },
  perfil: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'vendedor',
    validate: { isIn: [Object.keys(PERFIS)] },
  },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

module.exports = Funcionario;
