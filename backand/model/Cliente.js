// Tabela "clientes": quem faz solicitacoes pelo site
import { DataTypes } from 'sequelize';
import sequelize from './connect.js';

const Cliente = sequelize.define('clientes', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auth_id: { type: DataTypes.UUID },   // id do usuario no Supabase Auth
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    telefone: { type: DataTypes.STRING },
    endereco: { type: DataTypes.STRING }
});

export default Cliente;
