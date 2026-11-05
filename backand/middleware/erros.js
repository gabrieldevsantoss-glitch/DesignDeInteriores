/**
 * Tratamento centralizado de erros.
 * O Express 5 encaminha automaticamente para ca os erros de funcoes async.
 */
const { ValidationError, UniqueConstraintError } = require('sequelize');
const multer = require('multer');

/** Rota nao encontrada */
function naoEncontrado(req, res) {
  res.status(404).render('erro', {
    titulo: 'Página não encontrada',
    mensagem: 'O endereço acessado não existe.',
  });
}

/**
 * Converte erros conhecidos em mensagens amigaveis.
 * Erros de validacao voltam para a pagina anterior com aviso.
 */
// eslint-disable-next-line no-unused-vars
function tratarErro(err, req, res, next) {
  let mensagem = null;

  if (err instanceof UniqueConstraintError) {
    mensagem = 'Já existe um registro com esses dados (ex.: e-mail já cadastrado).';
  } else if (err instanceof ValidationError) {
    mensagem = err.errors.map((e) => e.message).join(' ');
  } else if (err instanceof multer.MulterError) {
    mensagem = 'Arquivo inválido. Envie imagens PNG, JPG, WEBP ou PDF de até 5 MB.';
  } else if (err.publico) {
    // Erros lancados pelos controllers com mensagem para o usuario
    mensagem = err.message;
  }

  if (mensagem && req.method === 'POST') {
    res.flash('erro', mensagem);
    return res.redirect(paginaAnterior(req));
  }

  console.error(err);
  res.status(err.status || 500).render('erro', {
    titulo: 'Algo deu errado',
    mensagem: mensagem || 'Ocorreu um erro inesperado. Tente novamente em instantes.',
  });
}

/**
 * Caminho da pagina anterior (somente se for do proprio site),
 * para evitar redirecionar o usuario para outro dominio.
 */
function paginaAnterior(req) {
  try {
    const url = new URL(req.get('Referrer'));
    if (url.host === req.get('host')) return url.pathname + url.search;
  } catch {
    // Referrer ausente ou invalido
  }
  return '/';
}

/**
 * Cria um erro com mensagem exibivel ao usuario.
 * Ex.: throw erroPublico('Estoque insuficiente', 400)
 */
function erroPublico(mensagem, status = 400) {
  const err = new Error(mensagem);
  err.publico = true;
  err.status = status;
  return err;
}

module.exports = { naoEncontrado, tratarErro, erroPublico };
