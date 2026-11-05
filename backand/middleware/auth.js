/**
 * Middlewares de autenticacao e autorizacao (RNF 01 e 02 / RF 13).
 *
 * Fluxo:
 *  1. No login, os tokens do Supabase Auth sao gravados em cookies httpOnly.
 *  2. A cada requisicao, "carregarUsuario" valida o token, renova se expirou
 *     e descobre se o usuario e um funcionario ou um cliente.
 *  3. Os middlewares "exigir..." bloqueiam rotas conforme o tipo/perfil.
 */
const { supabase } = require('../config/supabase');
const { Funcionario, Cliente } = require('../model');

const COOKIE_ACCESS = 'sb_access';
const COOKIE_REFRESH = 'sb_refresh';

// Cookies inacessiveis ao JavaScript do navegador (protege contra XSS)
const opcoesCookie = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
};

/** Grava os tokens da sessao do Supabase nos cookies. */
function salvarSessao(res, session) {
  res.cookie(COOKIE_ACCESS, session.access_token, opcoesCookie);
  res.cookie(COOKIE_REFRESH, session.refresh_token, opcoesCookie);
}

/** Remove os cookies de sessao (logout). */
function limparSessao(res) {
  res.clearCookie(COOKIE_ACCESS);
  res.clearCookie(COOKIE_REFRESH);
}

/**
 * Valida o access token. Se estiver expirado, tenta renovar com o refresh token.
 * Retorna o id do usuario no Supabase Auth ou null.
 */
async function obterAuthId(req, res) {
  const accessToken = req.cookies[COOKIE_ACCESS];
  const refreshToken = req.cookies[COOKIE_REFRESH];
  if (!accessToken) return null;

  // getClaims valida a assinatura do JWT (sem ida ao servidor quando possivel)
  const { data, error } = await supabase.auth.getClaims(accessToken);
  if (!error && data?.claims?.sub) return data.claims.sub;

  // Token invalido/expirado: tenta renovar a sessao
  if (!refreshToken) return null;
  const renovado = await supabase.auth.refreshSession({ refresh_token: refreshToken });
  if (renovado.error || !renovado.data.session) return null;

  salvarSessao(res, renovado.data.session);
  return renovado.data.user.id;
}

/**
 * Middleware global: preenche req.usuario e res.locals.usuario (para as views).
 * Formato: { tipo: 'funcionario' | 'cliente', id, nome, perfil?, registro }
 */
async function carregarUsuario(req, res, next) {
  req.usuario = null;
  res.locals.usuario = null;

  const authId = await obterAuthId(req, res).catch(() => null);
  if (!authId) {
    // Cookie existia mas nao e mais valido: limpa para nao tentar de novo
    if (req.cookies[COOKIE_ACCESS]) limparSessao(res);
    return next();
  }

  const funcionario = await Funcionario.findOne({ where: { auth_id: authId, ativo: true } });
  if (funcionario) {
    req.usuario = {
      tipo: 'funcionario',
      id: funcionario.id,
      nome: funcionario.nome,
      perfil: funcionario.perfil,
      registro: funcionario,
    };
  } else {
    const cliente = await Cliente.findOne({ where: { auth_id: authId } });
    if (cliente) {
      req.usuario = { tipo: 'cliente', id: cliente.id, nome: cliente.nome, registro: cliente };
    }
  }

  res.locals.usuario = req.usuario;
  next();
}

/** Exige qualquer usuario logado. */
function exigirLogin(req, res, next) {
  if (!req.usuario) {
    res.flash('erro', 'Faça login para continuar.');
    return res.redirect(`/login?voltar=${encodeURIComponent(req.originalUrl)}`);
  }
  next();
}

/** Exige um cliente logado (area "Minha conta"). */
function exigirCliente(req, res, next) {
  if (!req.usuario) return exigirLogin(req, res, next);
  if (req.usuario.tipo !== 'cliente') return res.redirect('/painel');
  next();
}

/** Exige um funcionario logado (painel administrativo). */
function exigirFuncionario(req, res, next) {
  if (!req.usuario) return exigirLogin(req, res, next);
  if (req.usuario.tipo !== 'funcionario') return res.redirect('/minha-conta');
  next();
}

/**
 * Exige um dos perfis informados. Uso: exigirPerfil('admin')
 * Deve vir depois de exigirFuncionario.
 */
function exigirPerfil(...perfis) {
  return (req, res, next) => {
    if (!perfis.includes(req.usuario.perfil)) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Seu perfil não tem permissão para acessar esta área.',
      });
    }
    next();
  };
}

module.exports = {
  salvarSessao,
  limparSessao,
  carregarUsuario,
  exigirLogin,
  exigirCliente,
  exigirFuncionario,
  exigirPerfil,
};
