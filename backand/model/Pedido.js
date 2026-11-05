/**
 * Model Pedido (RF 05, 06 e 14)
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { STATUS } = require('../config/constantes');

const Pedido = sequelize.define('pedidos', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  cliente_id: { type: DataTypes.BIGINT, allowNull: false },
  solicitacao_id: { type: DataTypes.BIGINT },
  funcionario_id: { type: DataTypes.BIGINT },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'confirmado',
    validate: { isIn: [Object.keys(STATUS)] },
  },
  valor_total: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
  endereco_entrega: { type: DataTypes.STRING(200) },
  previsao_entrega: { type: DataTypes.DATEONLY },
  observacoes: { type: DataTypes.TEXT },
});

module.exports = Pedido;
