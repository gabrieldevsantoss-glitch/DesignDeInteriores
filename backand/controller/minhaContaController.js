/**
 * MinhaContaController - area do cliente logado.
 * Casos de uso: solicitar produto/servico, consultar status da solicitacao
 * e consultar historico de pedidos (RF 04, 14 e 15).
 *
 * Toda consulta filtra por cliente_id do usuario logado, assim um cliente
 * nunca enxerga dados de outro.
 */
const {
  Solicitacao, SolicitacaoAnexo, Pedido, PedidoItem, Produto, Interacao, HistoricoStatus,
} = require('../model');
const { erroPublico } = require('../middleware/erros');

/** GET /minha-conta - resumo de solicitacoes e pedidos */
async function painel(req, res) {
  const clienteId = req.usuario.id;
  const [solicitacoes, pedidos] = await Promise.all([
    Solicitacao.findAll({
      where: { cliente_id: clienteId },
      include: [{ association: 'produto', attributes: ['nome'] }],
      order: [['created_at', 'DESC']],
    }),
    Pedido.findAll({ where: { cliente_id: clienteId }, order: [['created_at', 'DESC']] }),
  ]);
  res.render('minha-conta/painel', { titulo: 'Minha conta', solicitacoes, pedidos });
}

/** GET /minha-conta/solicitacoes/nova - formulario (RF 15) */
async function formSolicitacao(req, res) {
  const produtos = await Produto.findAll({ where: { ativo: true }, order: [['nome', 'ASC']] });
  res.render('minha-conta/solicitacao-nova', {
    titulo: 'Nova solicitação',
    produtos,
    produtoSelecionado: req.query.produto || '',
  });
}

/** POST /minha-conta/solicitacoes - grava a solicitacao e envia os anexos */
async function criarSolicitacao(req, res) {
  const solicitacao = await Solicitacao.abrir(req.usuario.id, req.body, req.files);
  res.flash('sucesso', `Solicitação enviada! Protocolo ${solicitacao.protocolo}.`);
  res.redirect(`/minha-conta/solicitacoes/${solicitacao.id}`);
}

/** GET /minha-conta/solicitacoes/:id - status e detalhes */
async function verSolicitacao(req, res) {
  const solicitacao = await Solicitacao.findOne({
    where: { id: req.params.id, cliente_id: req.usuario.id },
    include: [
      { association: 'produto', attributes: ['nome'] },
      { association: 'responsavel', attributes: ['nome'] },
      { association: 'anexos' },
    ],
  });
  if (!solicitacao) throw erroPublico('Solicitação não encontrada.', 404);

  const [historico, anexos, mensagens] = await Promise.all([
    HistoricoStatus.daEntidade('solicitacao', solicitacao.id),
    SolicitacaoAnexo.comLinks(solicitacao.anexos),
    // O cliente nao ve notas internas da equipe
    Interacao.findAll({
      where: { solicitacao_id: solicitacao.id },
      include: [{ association: 'funcionario', attributes: ['nome'] }],
      order: [['created_at', 'ASC']],
    }).then((lista) => lista.filter((i) => i.canal !== 'nota')),
  ]);

  res.render('minha-conta/solicitacao', {
    titulo: `Solicitação ${solicitacao.protocolo}`,
    solicitacao,
    historico,
    anexos,
    mensagens,
  });
}

/** POST /minha-conta/solicitacoes/:id/mensagens - cliente envia mensagem (RF 09) */
async function enviarMensagem(req, res) {
  const solicitacao = await Solicitacao.findOne({ where: { id: req.params.id, cliente_id: req.usuario.id } });
  if (!solicitacao) throw erroPublico('Solicitação não encontrada.', 404);

  await Interacao.create({
    cliente_id: req.usuario.id,
    solicitacao_id: solicitacao.id,
    canal: 'mensagem',
    descricao: req.body.descricao,
  });

  res.flash('sucesso', 'Mensagem enviada.');
  res.redirect(`/minha-conta/solicitacoes/${solicitacao.id}`);
}

/** GET /minha-conta/pedidos/:id - acompanhamento do pedido */
async function verPedido(req, res) {
  const pedido = await Pedido.findOne({
    where: { id: req.params.id, cliente_id: req.usuario.id },
    include: [
      { model: PedidoItem, as: 'itens', include: [{ association: 'produto', attributes: ['nome', 'tipo'] }] },
      { association: 'solicitacao', attributes: ['id', 'protocolo'] },
    ],
  });
  if (!pedido) throw erroPublico('Pedido não encontrado.', 404);

  const historico = await HistoricoStatus.daEntidade('pedido', pedido.id);
  res.render('minha-conta/pedido', { titulo: `Pedido #${pedido.id}`, pedido, historico });
}

/** GET /minha-conta/perfil */
function formPerfil(req, res) {
  res.render('minha-conta/perfil', { titulo: 'Meus dados', cliente: req.usuario.registro });
}

/** POST /minha-conta/perfil - o e-mail nao muda aqui (e o login) */
async function atualizarPerfil(req, res) {
  const campos = ['nome', 'telefone', 'cpf_cnpj', 'endereco', 'cidade', 'estado', 'cep'];
  const dados = Object.fromEntries(campos.map((c) => [c, req.body[c] || null]));
  await req.usuario.registro.update(dados);
  res.flash('sucesso', 'Dados atualizados.');
  res.redirect('/minha-conta/perfil');
}

module.exports = {
  painel,
  formSolicitacao,
  criarSolicitacao,
  verSolicitacao,
  enviarMensagem,
  verPedido,
  formPerfil,
  atualizarPerfil,
};
