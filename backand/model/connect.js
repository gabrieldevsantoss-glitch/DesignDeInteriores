// Conexao com o banco de dados PostgreSQL do Supabase usando o Sequelize
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false, // nao mostra os comandos SQL no terminal
    dialectOptions: {
        ssl: { require: true, rejectUnauthorized: false } // o Supabase exige SSL
    },
    define: {
        underscored: true,      // colunas created_at / updated_at
        freezeTableName: true   // usa o nome da tabela exatamente como escrito
    }
});

export default sequelize;
