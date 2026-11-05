/**
 * Model PedidoItem
 * Itens (produtos/servicos) de um pedido, com o preco do momento da venda.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');

const PedidoItem = sequelize.define('pedido_itens', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  pedido_id: { type: DataTypes.BIGINT, allowNull: false },
  produto_id: { type: DataTypes.BIGINT, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  preco_unitario: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
}, { timestamps: false });

module.exports = PedidoItem;
