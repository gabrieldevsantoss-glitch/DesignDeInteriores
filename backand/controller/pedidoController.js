/**
 * PedidoController - cadastro e acompanhamento de pedidos (RF 05, 06 e 10).
 */
const {
  Pedido, PedidoItem, Produto, Cliente, Solicitacao, MovimentacaoEstoque, HistoricoStatus, Interacao, sequelize,
} = require('../model');
const { STATUS } = require('../config/constantes');
const { erroPublico } = require('../middleware/erros');

/** Garante que um campo do formulario vire array (1 item chega como string) */
const comoLista = (valor) => (Array.isArray(valor) ? valor : valor ? [valor] : []);

/** GET /painel/pedidos */
async function listar(req, res) {
  const where = {};
  if (req.query.status && STATUS[req.query.status]) where.status = req.query.status;

  const pedidos = await Pedido.findAll({
    where,
    include: [
      { association: 'cliente', attributes: ['id', 'nome'] },
      { association: 'responsavel', attributes: ['nome'] },
    ],
    order: [['created_at', 'DESC']],
  });
  res.render('painel/pedidos/lista', { titulo: 'Pedidos', pedidos });
}

/**
 * GET /painel/pedidos/novo
 * Aceita ?solicitacao=ID para gerar o pedido a partir de uma solicitacao.
 */
async function formNovo(req, res) {
  const [clientes, produtos] = await Promise.all([
    Cliente.findAll({ attributes: ['id', 'nome', 'email', 'endereco', 'cidade', 'estado'], order: [['nome', 'ASC']] }),
    Produto.findAll({ where: { ativo: true }, order: [['nome', 'ASC']] }),
  ]);

  let solicitacao = null;
  if (req.query.solicitacao) {
    solicitacao = await Solicitacao.findByPk(req.query.solicitacao, { attributes: ['id', 'protocolo', 'cliente_id', 'produto_id'] });
  }

  res.render('painel/pedidos/form', { titulo: 'Novo pedido', clientes, produtos, solicitacao });
}

/**
 * POST /painel/pedidos
 * Cria pedido + itens e da baixa no estoque, tudo em uma transacao:
 * se faltar estoque de qualquer item, nada e gravado.
 */
async function criar(req, res) {
  const { cliente_id: clienteId, solicitacao_id: solicitacaoId, endereco_entrega, previsao_entrega, observacoes } = req.body;
  const produtosIds = comoLista(req.body.produto_id);
  const quantidades = comoLista(req.body.quantidade);

  // Monta os itens validos (ignora linhas vazias do formulario)
  const itens = produtosIds
    .map((id, i) => ({ produto_id: Number(id), quantidade: Number(quantidades[i]) }))
    .filter((item) => item.produto_id && item.quantidade > 0);
  if (!clienteId) throw erroPublico('Selecione o cliente.');
  if (!itens.length) throw erroPublico('Adicione pelo menos um item ao pedido.');

  const pedido = await sequelize.transaction(async (transaction) => {
    const novo = await Pedido.create({
      cliente_id: clienteId,
      solicitacao_id: solicitacaoId || null,
      funcionario_id: req.usuario.id,
      endereco_entrega,
      previsao_entrega: previsao_entrega || null,
      observacoes,
    }, { transaction });

    let total = 0;
    for (const item of itens) {
      const produto = await Produto.findByPk(item.produto_id, { transaction });
      if (!produto) throw erroPublico('Produto inválido no pedido.');

      // Usa o preco atual do produto (nao confia no valor vindo do navegador)
      await PedidoItem.create({
        pedido_id: novo.id,
        produto_id: produto.id,
        quantidade: item.quantidade,
        preco_unitario: produto.preco,
      }, { transaction });
      total += Number(produto.preco) * item.quantidade;

      // Baixa no estoque (servicos sao ignorados dentro do registrar)
      await MovimentacaoEstoque.registrar({
        produto_id: produto.id,
        tipo: 'saida',
        quantidade: item.quantidade,
        motivo: `Pedido #${novo.id}`,
        funcionario_id: req.usuario.id,
      }, transaction);
    }

    novo.valor_total = total;
    await novo.save({ transaction });

    await HistoricoStatus.registrar({
      entidade: 'pedido',
      entidade_id: novo.id,
      status_novo: novo.status,
      funcionario_id: req.usuario.id,
      observacao: 'Pedido criado',
    }, transaction);

    return novo;
  });

  // Se veio de uma solicitacao, ela passa a "confirmado"
  if (solicitacaoId) {
    const solicitacao = await Solicitacao.findByPk(solicitacaoId);
    if (solicitacao) {
      await HistoricoStatus.alterarStatus(solicitacao, 'solicitacao', 'confirmado', req.usuario.id, `Gerado pedido #${pedido.id}`);
    }
  }

  res.flash('sucesso', `Pedido #${pedido.id} criado.`);
  res.redirect(`/painel/pedidos/${pedido.id}`);
}

/** GET /painel/pedidos/:id */
async function ver(req, res) {
  const pedido = await Pedido.findByPk(req.params.id, {
    include: [
      { association: 'cliente' },
      { association: 'responsavel', attributes: ['nome'] },
      { association: 'solicitacao', attributes: ['id', 'protocolo'] },
      { model: PedidoItem, as: 'itens', include: [{ association: 'produto', attributes: ['id', 'nome', 'tipo'] }] },
    ],
  });
  if (!pedido) throw erroPublico('Pedido não encontrado.', 404);

  const [historico, interacoes] = await Promise.all([
    HistoricoStatus.daEntidade('pedido', pedido.id),
    Interacao.findAll({
      where: { pedido_id: pedido.id },
      include: [{ association: 'funcionario', attributes: ['nome'] }],
      order: [['created_at', 'DESC']],
    }),
  ]);

  res.render('painel/pedidos/detalhe', { titulo: `Pedido #${pedido.id}`, pedido, historico, interacoes });
}

/** POST /painel/pedidos/:id/status (RF 06 e 10) */
async function alterarStatus(req, res) {
  const pedido = await Pedido.findByPk(req.params.id);
  if (!pedido) throw erroPublico('Pedido não encontrado.', 404);

  await HistoricoStatus.alterarStatus(pedido, 'pedido', req.body.status, req.usuario.id, req.body.observacao);
  res.flash('sucesso', 'Status do pedido atualizado.');
  res.redirect(`/painel/pedidos/${pedido.id}`);
}

module.exports = { listar, formNovo, criar, ver, alterarStatus };
