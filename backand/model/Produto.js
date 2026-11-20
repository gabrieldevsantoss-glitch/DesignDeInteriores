// Tabela "produtos": catalogo de produtos e servicos
import { DataTypes } from 'sequelize';
import sequelize from './connect.js';

const Produto = sequelize.define('produtos', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    tipo: { type: DataTypes.STRING, defaultValue: 'produto' },   // 'produto' ou 'servico'
    categoria: { type: DataTypes.STRING },
    preco: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
    quantidade_estoque: { type: DataTypes.INTEGER, defaultValue: 0 },
    estoque_minimo: { type: DataTypes.INTEGER, defaultValue: 0 },   // abaixo disso = estoque baixo
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export default Produto;
