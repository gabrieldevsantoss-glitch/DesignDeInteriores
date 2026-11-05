/**
 * InteracaoController - registra contatos com o cliente (RF 09).
 * Usado pelas telas de cliente, solicitacao e pedido do painel.
 */
const { Interacao } = require('../model');

/**
 * POST /painel/interacoes
 * Campos ocultos do formulario: cliente_id, solicitacao_id, pedido_id e voltar.
 */
async function criar(req, res) {
  const { cliente_id, solicitacao_id, pedido_id, canal, descricao, voltar } = req.body;

  await Interacao.create({
    cliente_id,
    solicitacao_id: solicitacao_id || null,
    pedido_id: pedido_id || null,
    funcionario_id: req.usuario.id,
    canal,
    descricao,
  });

  res.flash('sucesso', 'Interação registrada.');
  // So volta para paginas do proprio painel
  res.redirect(voltar && voltar.startsWith('/painel/') ? voltar : '/painel');
}

module.exports = { criar };
