// Tabela "funcionarios": quem acessa o painel administrativo
import { DataTypes } from 'sequelize';
import sequelize from './connect.js';

const Funcionario = sequelize.define('funcionarios', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    auth_id: { type: DataTypes.UUID, allowNull: false }, // id do usuario no Supabase Auth
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    perfil: { type: DataTypes.STRING, defaultValue: 'admin' },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true }
});

export default Funcionario;
