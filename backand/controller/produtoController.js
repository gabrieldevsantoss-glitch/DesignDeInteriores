/**
 * ProdutoController - catalogo de produtos e servicos (RF 02).
 * Listagem liberada para todos os funcionarios; cadastro/edicao so para admin.
 */
const { Op } = require('sequelize');
const { Produto, MovimentacaoEstoque, sequelize } = require('../model');
const { erroPublico } = require('../middleware/erros');

const CAMPOS = ['nome', 'descricao', 'tipo', 'categoria', 'preco', 'estoque_minimo'];
const extrairDados = (body) => ({
  ...Object.fromEntries(CAMPOS.map((c) => [c, body[c] === '' ? null : body[c]])),
  ativo: body.ativo === 'on',
});

/** GET /painel/produtos?busca=&tipo= */
async function listar(req, res) {
  const { busca, tipo } = req.query;
  const where = {};
  if (busca) where.nome = { [Op.iLike]: `%${busca}%` };
  if (tipo) where.tipo = tipo;

  const produtos = await Produto.findAll({ where, order: [['nome', 'ASC']] });
  res.render('painel/produtos/lista', { titulo: 'Produtos e serviços', produtos });
}

/** GET /painel/produtos/novo */
function formNovo(req, res) {
  res.render('painel/produtos/form', { titulo: 'Novo produto', produto: { ativo: true, tipo: 'produto' } });
}

/**
 * POST /painel/produtos
 * O estoque inicial e lancado como uma movimentacao de entrada,
 * assim o historico de estoque fica completo desde o inicio.
 */
async function criar(req, res) {
  const estoqueInicial = Number(req.body.estoque_inicial || 0);

  const produto = await sequelize.transaction(async (transaction) => {
    const novo = await Produto.create(extrairDados(req.body), { transaction });
    if (estoqueInicial > 0) {
      await MovimentacaoEstoque.registrar({
        produto_id: novo.id,
        tipo: 'entrada',
        quantidade: estoqueInicial,
        motivo: 'Estoque inicial',
        funcionario_id: req.usuario.id,
      }, transaction);
    }
    return novo;
  });

  res.flash('sucesso', `"${produto.nome}" cadastrado.`);
  res.redirect('/painel/produtos');
}

/** GET /painel/produtos/:id/editar */
async function formEditar(req, res) {
  const produto = await Produto.findByPk(req.params.id);
  if (!produto) throw erroPublico('Produto não encontrado.', 404);
  res.render('painel/produtos/form', { titulo: 'Editar produto', produto });
}

/** POST /painel/produtos/:id - o saldo so muda pela tela de estoque */
async function atualizar(req, res) {
  const produto = await Produto.findByPk(req.params.id);
  if (!produto) throw erroPublico('Produto não encontrado.', 404);

  await produto.update(extrairDados(req.body));
  res.flash('sucesso', 'Produto atualizado.');
  res.redirect('/painel/produtos');
}

module.exports = { listar, formNovo, criar, formEditar, atualizar };
