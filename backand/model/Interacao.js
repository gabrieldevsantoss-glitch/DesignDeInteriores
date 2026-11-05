/**
 * Model Interacao (RF 09)
 * Historico de contatos entre clientes e funcionarios.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { CANAIS } = require('../config/constantes');

const Interacao = sequelize.define('interacoes', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.BIGINT, allowNull: false },
  funcionario_id: { type: DataTypes.BIGINT }, // nulo = mensagem enviada pelo proprio cliente
  solicitacao_id: { type: DataTypes.BIGINT },
  pedido_id: { type: DataTypes.BIGINT },
  canal: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'nota', validate: { isIn: [Object.keys(CANAIS)] } },
  descricao: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
}, { updatedAt: false });

module.exports = Interacao;
