/**
 * SolicitacaoController - gestao das solicitacoes no painel
 * (RF 04, 06, 07, 08 e 10).
 */
const { Op } = require('sequelize');
const {
  Solicitacao, SolicitacaoAnexo, Funcionario, Interacao, HistoricoStatus,
} = require('../model');
const { STATUS } = require('../config/constantes');
const { erroPublico } = require('../middleware/erros');

/** Busca a solicitacao ou lanca 404 */
async function buscar(id) {
  const solicitacao = await Solicitacao.findByPk(id);
  if (!solicitacao) throw erroPublico('Solicitação não encontrada.', 404);
  return solicitacao;
}

/** GET /painel/solicitacoes - lista com filtros (status, minhas, busca) */
async function listar(req, res) {
  const { status, minhas, busca } = req.query;
  const where = {};
  if (status && STATUS[status]) where.status = status;
  if (minhas) where.funcionario_id = req.usuario.id;
  if (busca) {
    where[Op.or] = [
      { protocolo: { [Op.iLike]: `%${busca}%` } },
      { '$cliente.nome$': { [Op.iLike]: `%${busca}%` } },
    ];
  }

  const solicitacoes = await Solicitacao.findAll({
    where,
    include: [
      { association: 'cliente', attributes: ['id', 'nome'] },
      { association: 'responsavel', attributes: ['nome'] },
    ],
    order: [['created_at', 'DESC']],
  });

  res.render('painel/solicitacoes/lista', { titulo: 'Solicitações', solicitacoes });
}

/** GET /painel/solicitacoes/:id - detalhes completos */
async function ver(req, res) {
  const solicitacao = await Solicitacao.findByPk(req.params.id, {
    include: [
      { association: 'cliente' },
      { association: 'responsavel', attributes: ['id', 'nome'] },
      { association: 'produto', attributes: ['id', 'nome'] },
      { association: 'anexos' },
      { association: 'pedidos', attributes: ['id', 'status', 'valor_total'] },
    ],
  });
  if (!solicitacao) throw erroPublico('Solicitação não encontrada.', 404);

  const [historico, anexos, interacoes, funcionarios] = await Promise.all([
    HistoricoStatus.daEntidade('solicitacao', solicitacao.id),
    SolicitacaoAnexo.comLinks(solicitacao.anexos),
    Interacao.findAll({
      where: { solicitacao_id: solicitacao.id },
      include: [{ association: 'funcionario', attributes: ['nome'] }],
      order: [['created_at', 'DESC']],
    }),
    Funcionario.findAll({ where: { ativo: true }, attributes: ['id', 'nome'], order: [['nome', 'ASC']] }),
  ]);

  res.render('painel/solicitacoes/detalhe', {
    titulo: `Solicitação ${solicitacao.protocolo}`,
    solicitacao,
    historico,
    anexos,
    interacoes,
    funcionarios,
  });
}

/**
 * POST /painel/solicitacoes/:id/assumir (RF 08)
 * O funcionario logado vira o responsavel. Se ainda estava "aguardando
 * contato", o status avanca para "encaminhado ao atendente".
 */
async function assumir(req, res) {
  const solicitacao = await buscar(req.params.id);
  await solicitacao.update({ funcionario_id: req.usuario.id });

  if (solicitacao.status === 'aguardando_contato') {
    await HistoricoStatus.alterarStatus(
      solicitacao, 'solicitacao', 'encaminhado_atendente', req.usuario.id,
      `Assumida por ${req.usuario.nome}`
    );
  }

  res.flash('sucesso', 'Você agora é o responsável por esta solicitação.');
  res.redirect(`/painel/solicitacoes/${solicitacao.id}`);
}

/** POST /painel/solicitacoes/:id/encaminhar - admin define o responsavel */
async function encaminhar(req, res) {
  const solicitacao = await buscar(req.params.id);
  const funcionario = await Funcionario.findOne({ where: { id: req.body.funcionario_id, ativo: true } });
  if (!funcionario) throw erroPublico('Funcionário inválido.');

  await solicitacao.update({ funcionario_id: funcionario.id });
  await HistoricoStatus.alterarStatus(
    solicitacao, 'solicitacao', 'encaminhado_atendente', req.usuario.id,
    `Encaminhada para ${funcionario.nome}`
  );

  res.flash('sucesso', `Solicitação encaminhada para ${funcionario.nome}.`);
  res.redirect(`/painel/solicitacoes/${solicitacao.id}`);
}

/** POST /painel/solicitacoes/:id/status (RF 06 e 10) */
async function alterarStatus(req, res) {
  const solicitacao = await buscar(req.params.id);
  await HistoricoStatus.alterarStatus(
    solicitacao, 'solicitacao', req.body.status, req.usuario.id, req.body.observacao
  );
  res.flash('sucesso', 'Status atualizado.');
  res.redirect(`/painel/solicitacoes/${solicitacao.id}`);
}

module.exports = { listar, ver, assumir, encaminhar, alterarStatus };
