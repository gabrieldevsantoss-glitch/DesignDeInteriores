// Tabela "pedidos": criada quando o administrador fecha uma solicitacao
import { DataTypes } from 'sequelize';
import sequelize from './connect.js';

const Pedido = sequelize.define('pedidos', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    cliente_id: { type: DataTypes.BIGINT, allowNull: false },
    solicitacao_id: { type: DataTypes.BIGINT },
    status: { type: DataTypes.STRING, defaultValue: 'confirmado' },
    valor_total: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    previsao_entrega: { type: DataTypes.DATEONLY },
    observacoes: { type: DataTypes.TEXT }
});

export default Pedido;
