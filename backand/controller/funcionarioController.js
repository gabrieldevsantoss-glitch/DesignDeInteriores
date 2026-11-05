/**
 * FuncionarioController - usuarios internos e permissoes (RF 12 e 13).
 * Acesso exclusivo do perfil admin.
 */
const { supabaseAdmin } = require('../config/supabase');
const { Funcionario } = require('../model');
const { erroPublico } = require('../middleware/erros');

/** GET /painel/funcionarios */
async function listar(req, res) {
  const funcionarios = await Funcionario.findAll({ order: [['nome', 'ASC']] });
  res.render('painel/funcionarios/lista', { titulo: 'Funcionários', funcionarios });
}

/** GET /painel/funcionarios/novo */
function formNovo(req, res) {
  res.render('painel/funcionarios/form', { titulo: 'Novo funcionário', funcionario: { perfil: 'vendedor', ativo: true } });
}

/**
 * POST /painel/funcionarios
 * Cria o login no Supabase Auth e depois o registro de funcionario.
 */
async function criar(req, res) {
  const { nome, email, telefone, perfil, senha } = req.body;
  if (!senha || senha.length < 6) throw erroPublico('A senha deve ter pelo menos 6 caracteres.');

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, tipo: 'funcionario' },
  });
  if (error) throw erroPublico(`Não foi possível criar o login: ${error.message}`);

  try {
    await Funcionario.create({ auth_id: data.user.id, nome, email, telefone, perfil });
  } catch (err) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id); // desfaz o login criado
    throw err;
  }

  res.flash('sucesso', `${nome} cadastrado(a).`);
  res.redirect('/painel/funcionarios');
}

/** GET /painel/funcionarios/:id/editar */
async function formEditar(req, res) {
  const funcionario = await Funcionario.findByPk(req.params.id);
  if (!funcionario) throw erroPublico('Funcionário não encontrado.', 404);
  res.render('painel/funcionarios/form', { titulo: 'Editar funcionário', funcionario });
}

/**
 * POST /painel/funcionarios/:id
 * Atualiza dados, perfil e status. Senha nova e opcional.
 */
async function atualizar(req, res) {
  const funcionario = await Funcionario.findByPk(req.params.id);
  if (!funcionario) throw erroPublico('Funcionário não encontrado.', 404);

  const { nome, telefone, perfil, senha } = req.body;
  const ativo = req.body.ativo === 'on';

  // Impede que o admin se bloqueie ou perca o proprio acesso de admin
  if (funcionario.id === req.usuario.id && (!ativo || perfil !== 'admin')) {
    throw erroPublico('Você não pode desativar ou rebaixar o seu próprio usuário.');
  }

  if (senha) {
    if (senha.length < 6) throw erroPublico('A senha deve ter pelo menos 6 caracteres.');
    const { error } = await supabaseAdmin.auth.admin.updateUserById(funcionario.auth_id, { password: senha });
    if (error) throw erroPublico(`Não foi possível alterar a senha: ${error.message}`);
  }

  await funcionario.update({ nome, telefone, perfil, ativo });
  res.flash('sucesso', 'Funcionário atualizado.');
  res.redirect('/painel/funcionarios');
}

module.exports = { listar, formNovo, criar, formEditar, atualizar };
