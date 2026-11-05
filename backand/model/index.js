/**
 * Ponto unico de acesso aos models.
 * Aqui sao definidos os relacionamentos entre as tabelas.
 */
const sequelize = require('./connect');
const Funcionario = require('./Funcionario');
const Cliente = require('./Cliente');
const Produto = require('./Produto');
const MovimentacaoEstoque = require('./MovimentacaoEstoque');
const Solicitacao = require('./Solicitacao');
const SolicitacaoAnexo = require('./SolicitacaoAnexo');
const Pedido = require('./Pedido');
const PedidoItem = require('./PedidoItem');
const Interacao = require('./Interacao');
const HistoricoStatus = require('./HistoricoStatus');

// Cliente 1:N Solicitacoes / Pedidos / Interacoes
Cliente.hasMany(Solicitacao, { foreignKey: 'cliente_id', as: 'solicitacoes' });
Solicitacao.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cliente.hasMany(Pedido, { foreignKey: 'cliente_id', as: 'pedidos' });
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

Cliente.hasMany(Interacao, { foreignKey: 'cliente_id', as: 'interacoes' });
Interacao.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// Funcionario responsavel / autor do registro
Solicitacao.belongsTo(Funcionario, { foreignKey: 'funcionario_id', as: 'responsavel' });
Pedido.belongsTo(Funcionario, { foreignKey: 'funcionario_id', as: 'responsavel' });
Interacao.belongsTo(Funcionario, { foreignKey: 'funcionario_id', as: 'funcionario' });
MovimentacaoEstoque.belongsTo(Funcionario, { foreignKey: 'funcionario_id', as: 'funcionario' });
HistoricoStatus.belongsTo(Funcionario, { foreignKey: 'funcionario_id', as: 'funcionario' });

// Solicitacao -> produto de interesse, anexos e pedidos gerados
Solicitacao.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });
Solicitacao.hasMany(SolicitacaoAnexo, { foreignKey: 'solicitacao_id', as: 'anexos' });
SolicitacaoAnexo.belongsTo(Solicitacao, { foreignKey: 'solicitacao_id' });
Solicitacao.hasMany(Pedido, { foreignKey: 'solicitacao_id', as: 'pedidos' });
Pedido.belongsTo(Solicitacao, { foreignKey: 'solicitacao_id', as: 'solicitacao' });

// Pedido 1:N Itens -> Produto
Pedido.hasMany(PedidoItem, { foreignKey: 'pedido_id', as: 'itens' });
PedidoItem.belongsTo(Pedido, { foreignKey: 'pedido_id' });
PedidoItem.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });

// Estoque
Produto.hasMany(MovimentacaoEstoque, { foreignKey: 'produto_id', as: 'movimentacoes' });
MovimentacaoEstoque.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });

module.exports = {
  sequelize,
  Funcionario,
  Cliente,
  Produto,
  MovimentacaoEstoque,
  Solicitacao,
  SolicitacaoAnexo,
  Pedido,
  PedidoItem,
  Interacao,
  HistoricoStatus,
};
