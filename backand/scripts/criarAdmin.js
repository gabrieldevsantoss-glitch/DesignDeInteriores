/**
 * Cria o primeiro administrador do sistema.
 *
 * Uso:
 *   npm run criar-admin -- "Nome do Admin" email@empresa.com senha123
 */
require('dotenv').config({ quiet: true });
const { supabaseAdmin } = require('../config/supabase');
const { Funcionario, sequelize } = require('../model');

async function main() {
  const [nome, email, senha] = process.argv.slice(2);
  if (!nome || !email || !senha) {
    console.log('Uso: npm run criar-admin -- "Nome" email@empresa.com senha');
    process.exit(1);
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, tipo: 'funcionario' },
  });
  if (error) throw new Error(error.message);

  await Funcionario.create({ auth_id: data.user.id, nome, email, perfil: 'admin' });
  console.log(`Administrador ${email} criado. Acesse /login.`);
}

main()
  .catch((err) => {
    console.error('Erro:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
