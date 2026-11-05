/**
 * PainelController - dashboard do painel administrativo (RF 11).
 * Mostra os principais numeros de solicitacoes, pedidos e estoque.
 */
const { Op, fn, col } = require('sequelize');
const { Solicitacao, Pedido, Produto, sequelize } = require('../model');

/** Converte [{status, total}] em { status: total } */
const contarPorStatus = (linhas) =>
  Object.fromEntries(linhas.map((l) => [l.status, Number(l.get('total'))]));

/** GET /painel */
async function dashboard(req, res) {
  const agrupar = { attributes: ['status', [fn('COUNT', col('id')), 'total']], group: ['status'] };

  const [solPorStatus, pedPorStatus, recentes, minhas, estoqueBaixo, faturamento] = await Promise.all([
    Solicitacao.findAll(agrupar),
    Pedido.findAll(agrupar),
    // Ultimas solicitacoes que ainda nao tem responsavel
    Solicitacao.findAll({
      where: { funcionario_id: null },
      include: [{ association: 'cliente', attributes: ['nome'] }],
      order: [['created_at', 'DESC']],
      limit: 5,
    }),
    // Solicitacoes em aberto do funcionario logado (RF 08)
    Solicitacao.findAll({
      where: { funcionario_id: req.usuario.id, status: { [Op.ne]: 'concluido' } },
      include: [{ association: 'cliente', attributes: ['nome'] }],
      order: [['updated_at', 'DESC']],
      limit: 5,
    }),
    // Produtos no limite ou abaixo do estoque minimo
    Produto.findAll({
      where: {
        tipo: 'produto',
        ativo: true,
        quantidade_estoque: { [Op.lte]: sequelize.col('estoque_minimo') },
      },
      order: [['quantidade_estoque', 'ASC']],
      limit: 5,
    }),
    // Valor total dos pedidos ja concluidos
    Pedido.sum('valor_total', { where: { status: 'concluido' } }),
  ]);

  const solicitacoesStatus = contarPorStatus(solPorStatus);
  const pedidosStatus = contarPorStatus(pedPorStatus);
  const soma = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  res.render('painel/dashboard', {
    titulo: 'Painel',
    solicitacoesStatus,
    pedidosStatus,
    totais: {
      solicitacoes: soma(solicitacoesStatus),
      novas: solicitacoesStatus.aguardando_contato || 0,
      pedidosAndamento: soma(pedidosStatus) - (pedidosStatus.concluido || 0),
      faturamento: faturamento || 0,
    },
    recentes,
    minhas,
    estoqueBaixo,
  });
}

/** GET /painel/mais - menu completo usado na barra inferior do celular */
function mais(req, res) {
  res.render('painel/mais', { titulo: 'Menu' });
}

module.exports = { dashboard, mais };
