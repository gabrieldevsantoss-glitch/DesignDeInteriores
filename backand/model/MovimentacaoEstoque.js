/**
 * Model MovimentacaoEstoque (RF 03)
 * Cada entrada ou saida de estoque fica registrada aqui.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { erroPublico } = require('../middleware/erros');

const MovimentacaoEstoque = sequelize.define('movimentacoes_estoque', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  produto_id: { type: DataTypes.BIGINT, allowNull: false },
  funcionario_id: { type: DataTypes.BIGINT },
  tipo: { type: DataTypes.STRING(10), allowNull: false, validate: { isIn: [['entrada', 'saida']] } },
  quantidade: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
  motivo: { type: DataTypes.STRING(200) },
}, { updatedAt: false });

/**
 * Registra uma entrada/saida e atualiza o saldo do produto.
 * Deve ser chamado dentro de uma transacao; a linha do produto e
 * travada (FOR UPDATE) para evitar saldo errado em acessos simultaneos.
 *
 * @param {object} dados - { produto_id, tipo, quantidade, motivo, funcionario_id }
 * @param {object} transaction - transacao Sequelize (obrigatoria)
 */
MovimentacaoEstoque.registrar = async (dados, transaction) => {
  // require aqui para evitar dependencia circular entre models
  const Produto = require('./Produto');
  const quantidade = Number(dados.quantidade);

  const produto = await Produto.findByPk(dados.produto_id, { transaction, lock: transaction.LOCK.UPDATE });
  if (!produto) throw erroPublico('Produto não encontrado.');
  if (produto.tipo === 'servico') return null; // servicos nao controlam estoque

  if (dados.tipo === 'saida' && produto.quantidade_estoque < quantidade) {
    throw erroPublico(`Estoque insuficiente para "${produto.nome}" (disponível: ${produto.quantidade_estoque}).`);
  }

  produto.quantidade_estoque += dados.tipo === 'entrada' ? quantidade : -quantidade;
  await produto.save({ transaction });

  return MovimentacaoEstoque.create({ ...dados, quantidade }, { transaction });
};

module.exports = MovimentacaoEstoque;
