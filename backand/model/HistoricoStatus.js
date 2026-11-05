/**
 * Model HistoricoStatus (RF 06 e 10)
 * Registra quem alterou o status, quando, e de qual para qual valor.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');

const HistoricoStatus = sequelize.define('historico_status', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  entidade: { type: DataTypes.STRING(12), allowNull: false, validate: { isIn: [['solicitacao', 'pedido']] } },
  entidade_id: { type: DataTypes.BIGINT, allowNull: false },
  status_anterior: { type: DataTypes.STRING(30) },
  status_novo: { type: DataTypes.STRING(30), allowNull: false },
  funcionario_id: { type: DataTypes.BIGINT },
  observacao: { type: DataTypes.STRING(300) },
}, { updatedAt: false });

/**
 * Atalho para registrar uma mudanca de status.
 * @param {object} dados - { entidade, entidade_id, status_anterior, status_novo, funcionario_id, observacao }
 * @param {object} [transaction] - transacao Sequelize opcional
 */
HistoricoStatus.registrar = (dados, transaction) =>
  HistoricoStatus.create(dados, { transaction });

/**
 * Altera o status de uma solicitacao ou pedido e grava o historico,
 * tudo dentro de uma transacao (RF 06 e 10).
 *
 * @param {Model}  registro       - instancia de Solicitacao ou Pedido
 * @param {string} entidade       - 'solicitacao' | 'pedido'
 * @param {string} novoStatus
 * @param {number} funcionario_id - quem fez a alteracao
 * @param {string} [observacao]
 */
HistoricoStatus.alterarStatus = async (registro, entidade, novoStatus, funcionario_id, observacao) => {
  const statusAnterior = registro.status;
  if (statusAnterior === novoStatus) return registro;

  await sequelize.transaction(async (transaction) => {
    registro.status = novoStatus;
    await registro.save({ transaction });
    await HistoricoStatus.registrar({
      entidade,
      entidade_id: registro.id,
      status_anterior: statusAnterior,
      status_novo: novoStatus,
      funcionario_id,
      observacao: observacao || null,
    }, transaction);
  });

  return registro;
};

/**
 * Busca a linha do tempo de uma solicitacao ou pedido (mais recente primeiro).
 */
HistoricoStatus.daEntidade = (entidade, entidade_id) =>
  HistoricoStatus.findAll({
    where: { entidade, entidade_id },
    include: [{ association: 'funcionario', attributes: ['nome'] }],
    order: [['created_at', 'DESC']],
  });

module.exports = HistoricoStatus;
