/**
 * ClienteController - cadastro de clientes pelo painel (RF 01 e 14).
 */
const { Op } = require('sequelize');
const { Cliente, Solicitacao, Pedido, Interacao } = require('../model');
const { erroPublico } = require('../middleware/erros');

// Campos editaveis pelo formulario
const CAMPOS = ['nome', 'email', 'telefone', 'cpf_cnpj', 'endereco', 'cidade', 'estado', 'cep', 'observacoes'];
const extrairDados = (body) => Object.fromEntries(CAMPOS.map((c) => [c, body[c] || null]));

/** GET /painel/clientes?busca= */
async function listar(req, res) {
  const { busca } = req.query;
  const where = busca
    ? { [Op.or]: ['nome', 'email', 'telefone'].map((c) => ({ [c]: { [Op.iLike]: `%${busca}%` } })) }
    : {};

  const clientes = await Cliente.findAll({ where, order: [['nome', 'ASC']] });
  res.render('painel/clientes/lista', { titulo: 'Clientes', clientes });
}

/** GET /painel/clientes/novo */
function formNovo(req, res) {
  res.render('painel/clientes/form', { titulo: 'Novo cliente', cliente: {} });
}

/** POST /painel/clientes */
async function criar(req, res) {
  const cliente = await Cliente.create(extrairDados(req.body));
  res.flash('sucesso', 'Cliente cadastrado.');
  res.redirect(`/painel/clientes/${cliente.id}`);
}

/**
 * GET /painel/clientes/:id
 * Ficha do cliente com historico de pedidos, solicitacoes e interacoes (RF 09 e 14).
 */
async function ver(req, res) {
  const cliente = await Cliente.findByPk(req.params.id, {
    include: [
      { model: Solicitacao, as: 'solicitacoes' },
      { model: Pedido, as: 'pedidos' },
      {
        model: Interacao,
        as: 'interacoes',
        include: [{ association: 'funcionario', attributes: ['nome'] }],
      },
    ],
    order: [
      [{ model: Solicitacao, as: 'solicitacoes' }, 'created_at', 'DESC'],
      [{ model: Pedido, as: 'pedidos' }, 'created_at', 'DESC'],
      [{ model: Interacao, as: 'interacoes' }, 'created_at', 'DESC'],
    ],
  });
  if (!cliente) throw erroPublico('Cliente não encontrado.', 404);

  res.render('painel/clientes/detalhe', { titulo: cliente.nome, cliente });
}

/** GET /painel/clientes/:id/editar */
async function formEditar(req, res) {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) throw erroPublico('Cliente não encontrado.', 404);
  res.render('painel/clientes/form', { titulo: 'Editar cliente', cliente });
}

/** POST /painel/clientes/:id */
async function atualizar(req, res) {
  const cliente = await Cliente.findByPk(req.params.id);
  if (!cliente) throw erroPublico('Cliente não encontrado.', 404);

  const dados = extrairDados(req.body);
  // O e-mail de quem tem conta e o login: nao pode ser trocado por aqui
  if (cliente.auth_id) delete dados.email;

  await cliente.update(dados);
  res.flash('sucesso', 'Cliente atualizado.');
  res.redirect(`/painel/clientes/${cliente.id}`);
}

module.exports = { listar, formNovo, criar, ver, formEditar, atualizar };
