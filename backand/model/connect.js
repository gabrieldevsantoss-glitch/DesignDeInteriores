/**
 * Conexao com o PostgreSQL do Supabase via Sequelize.
 * A string de conexao vem do .env (DATABASE_URL - "Session pooler").
 */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  // O Supabase exige conexao criptografada
  dialectOptions: {
    ssl: { require: true, rejectUnauthorized: false },
  },
  // Padroes para todos os models: colunas em snake_case
  // (created_at / updated_at) iguais as do schema.sql
  define: {
    underscored: true,
    freezeTableName: true,
    timestamps: true,
  },
  pool: { max: 5, min: 0, idle: 10000 },
});

module.exports = sequelize;
