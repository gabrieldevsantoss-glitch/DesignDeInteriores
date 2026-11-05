/**
 * EstoqueController - entradas, saidas e saldo (RF 03).
 */
const { Produto, MovimentacaoEstoque, sequelize } = require('../model');

/** GET /painel/estoque - saldo atual + ultimas movimentacoes */
async function listar(req, res) {
  const where = req.query.produto ? { produto_id: req.query.produto } : {};

  const [produtos, movimentacoes] = await Promise.all([
    Produto.findAll({ where: { tipo: 'produto' }, order: [['nome', 'ASC']] }),
    MovimentacaoEstoque.findAll({
      where,
      include: [
        { association: 'produto', attributes: ['id', 'nome'] },
        { association: 'funcionario', attributes: ['nome'] },
      ],
      order: [['created_at', 'DESC']],
      limit: 50,
    }),
  ]);

  res.render('painel/estoque', { titulo: 'Estoque', produtos, movimentacoes });
}

/** POST /painel/estoque - registra entrada ou saida manual */
async function registrar(req, res) {
  const { produto_id, tipo, quantidade, motivo } = req.body;

  await sequelize.transaction((transaction) =>
    MovimentacaoEstoque.registrar(
      { produto_id, tipo, quantidade, motivo, funcionario_id: req.usuario.id },
      transaction
    )
  );

  res.flash('sucesso', `${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada.`);
  res.redirect('/painel/estoque');
}

module.exports = { listar, registrar };
