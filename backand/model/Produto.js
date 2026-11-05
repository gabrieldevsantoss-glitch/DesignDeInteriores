/**
 * Model Produto (RF 02 e 03)
 * Representa tanto produtos fisicos quanto servicos (campo "tipo").
 * O saldo de estoque fica em quantidade_estoque.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { TIPOS_PRODUTO } = require('../config/constantes');

const Produto = sequelize.define('produtos', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
  descricao: { type: DataTypes.TEXT },
  tipo: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'produto',
    validate: { isIn: [Object.keys(TIPOS_PRODUTO)] },
  },
  categoria: { type: DataTypes.STRING(60) },
  preco: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0, validate: { min: 0 } },
  quantidade_estoque: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  estoque_minimo: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, validate: { min: 0 } },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
});

module.exports = Produto;
