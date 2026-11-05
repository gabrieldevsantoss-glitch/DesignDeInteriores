/**
 * Model Cliente (RF 01)
 * auth_id e preenchido quando o cliente cria uma conta no site;
 * fica nulo quando o cadastro e feito por um funcionario.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { supabaseAdmin } = require('../config/supabase');
const { erroPublico } = require('../middleware/erros');

const Cliente = sequelize.define('clientes', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  auth_id: { type: DataTypes.UUID, unique: true },
  nome: { type: DataTypes.STRING(120), allowNull: false, validate: { notEmpty: true } },
  email: { type: DataTypes.STRING(160), allowNull: false, unique: true, validate: { isEmail: true } },
  telefone: { type: DataTypes.STRING(20) },
  cpf_cnpj: { type: DataTypes.STRING(18) },
  endereco: { type: DataTypes.STRING(200) },
  cidade: { type: DataTypes.STRING(80) },
  estado: { type: DataTypes.CHAR(2) },
  cep: { type: DataTypes.STRING(9) },
  observacoes: { type: DataTypes.TEXT },
});

/**
 * Cria a conta do cliente no Supabase Auth e o registro na tabela clientes.
 * Se o cliente ja foi cadastrado antes por um funcionario (mesmo e-mail,
 * sem conta), a conta e vinculada a esse cadastro existente.
 *
 * @param {object} dados - { nome, email, telefone, endereco, senha }
 * @returns {Promise<Cliente>}
 */
Cliente.criarConta = async ({ nome, email, telefone, endereco, senha }) => {
  if (!nome || !email || !senha) throw erroPublico('Preencha nome, e-mail e senha.');
  if (senha.length < 6) throw erroPublico('A senha deve ter pelo menos 6 caracteres.');

  const existente = await Cliente.findOne({ where: { email } });
  if (existente?.auth_id) throw erroPublico('Este e-mail já possui conta. Faça login para continuar.');

  // Usuario criado ja confirmado (sem e-mail de confirmacao)
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, tipo: 'cliente' },
  });
  if (error) throw erroPublico(`Não foi possível criar a conta: ${error.message}`);

  try {
    if (existente) {
      return await existente.update({
        auth_id: data.user.id,
        nome,
        telefone: telefone || existente.telefone,
        endereco: endereco || existente.endereco,
      });
    }
    return await Cliente.create({ auth_id: data.user.id, nome, email, telefone, endereco });
  } catch (err) {
    // Desfaz o usuario do Auth para nao deixar conta "orfa"
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw err;
  }
};

module.exports = Cliente;
