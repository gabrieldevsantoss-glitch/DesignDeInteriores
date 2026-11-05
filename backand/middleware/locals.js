/**
 * Disponibiliza constantes e funcoes de formatacao para todas as views EJS.
 */
const constantes = require('../config/constantes');

const formatoMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const formatoData = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' });
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

const helpers = {
  /** 1234.5 -> "R$ 1.234,50" */
  moeda: (valor) => formatoMoeda.format(Number(valor || 0)),
  /** Date/ISO -> "05/11/2026" */
  data: (valor) => (valor ? formatoData.format(new Date(valor)) : '-'),
  /** Date/ISO -> "05/11/2026 13:45" */
  dataHora: (valor) => (valor ? formatoDataHora.format(new Date(valor)) : '-'),
};

function locals(req, res, next) {
  Object.assign(res.locals, constantes, helpers);
  res.locals.caminho = req.path; // usado para destacar o item ativo do menu
  res.locals.query = req.query;
  next();
}

module.exports = locals;
