/**
 * AuthController - login, cadastro de cliente e logout (RNF 01).
 * A autenticacao e feita pelo Supabase Auth; aqui so ligamos o usuario
 * do Auth ao registro de Funcionario ou Cliente.
 */
const { supabase } = require('../config/supabase');
const { salvarSessao, limparSessao } = require('../middleware/auth');
const { Funcionario, Cliente, Solicitacao } = require('../model');
const { erroPublico } = require('../middleware/erros');

/** Aceita apenas caminhos internos no parametro "voltar" */
const destinoSeguro = (url) => (url && url.startsWith('/') && !url.startsWith('//') ? url : null);

/** GET /login */
function formLogin(req, res) {
  if (req.usuario) return res.redirect(req.usuario.tipo === 'funcionario' ? '/painel' : '/minha-conta');
  res.render('auth/login', { titulo: 'Entrar', voltar: req.query.voltar || '', email: '' });
}

/** POST /login */
async function login(req, res) {
  const { email, senha, voltar } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) {
    return res.status(401).render('auth/login', {
      titulo: 'Entrar',
      voltar,
      email,
      erro: 'E-mail ou senha inválidos.',
    });
  }

  // Descobre se e funcionario (ativo) ou cliente
  const authId = data.user.id;
  const funcionario = await Funcionario.findOne({ where: { auth_id: authId, ativo: true } });
  const cliente = funcionario ? null : await Cliente.findOne({ where: { auth_id: authId } });

  if (!funcionario && !cliente) {
    return res.status(403).render('auth/login', {
      titulo: 'Entrar',
      voltar,
      email,
      erro: 'Usuário sem acesso ao sistema. Fale com o administrador.',
    });
  }

  salvarSessao(res, data.session);
  const padrao = funcionario ? '/painel' : '/minha-conta';
  res.redirect(destinoSeguro(voltar) || padrao);
}

/** GET /cadastro */
function formCadastro(req, res) {
  res.render('auth/cadastro', { titulo: 'Criar conta', dados: {} });
}

/**
 * Faz login logo apos criar a conta (usado no cadastro e no contato).
 */
async function entrarAposCadastro(res, email, senha) {
  const { data } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (data?.session) salvarSessao(res, data.session);
}

/** POST /cadastro - cria a conta do cliente (RF 01) */
async function cadastrar(req, res) {
  const { email, senha, confirmar_senha: confirmar } = req.body;
  const renderErro = (erro) =>
    res.status(400).render('auth/cadastro', { titulo: 'Criar conta', dados: req.body, erro });

  if (senha !== confirmar) return renderErro('As senhas não conferem.');

  try {
    await Cliente.criarConta(req.body);
  } catch (err) {
    if (err.publico) return renderErro(err.message); // mostra o erro no proprio formulario
    throw err;
  }

  await entrarAposCadastro(res, email, senha);
  res.flash('sucesso', 'Conta criada! Agora você pode enviar sua solicitação.');
  res.redirect('/minha-conta');
}

/**
 * POST /contato - formulario "Contato" da pagina inicial (RF 01, 04 e 15).
 * - Cliente logado: so abre a solicitacao.
 * - Visitante: cria a conta com os "dados cliente" e ja abre a solicitacao.
 */
async function contato(req, res) {
  if (req.usuario?.tipo === 'funcionario') {
    throw erroPublico('Você está logado como funcionário. Saia e use uma conta de cliente para enviar solicitações.');
  }

  let clienteId = req.usuario?.tipo === 'cliente' ? req.usuario.id : null;

  if (!clienteId) {
    const cliente = await Cliente.criarConta(req.body);
    await entrarAposCadastro(res, req.body.email, req.body.senha);
    clienteId = cliente.id;
  }

  const solicitacao = await Solicitacao.abrir(clienteId, req.body, req.files);
  res.flash('sucesso', `Solicitação enviada! Protocolo ${solicitacao.protocolo}. Acompanhe o status por aqui.`);
  res.redirect(`/minha-conta/solicitacoes/${solicitacao.id}`);
}

/** POST /logout */
function logout(req, res) {
  limparSessao(res);
  res.redirect('/');
}

module.exports = { formLogin, login, formCadastro, cadastrar, contato, logout };
