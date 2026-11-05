/**
 * Model Solicitacao (RF 04, 07, 08 e 15)
 * Pedido de projeto/orcamento enviado pelo cliente pelo site.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { STATUS, ESPACOS, ESTILOS } = require('../config/constantes');

const Solicitacao = sequelize.define('solicitacoes', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  protocolo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  cliente_id: { type: DataTypes.BIGINT, allowNull: false },
  funcionario_id: { type: DataTypes.BIGINT }, // funcionario responsavel (RF 08)
  produto_id: { type: DataTypes.BIGINT },     // produto/servico de interesse
  espaco: { type: DataTypes.STRING(20), allowNull: false, validate: { isIn: [Object.keys(ESPACOS)] } },
  estilo: { type: DataTypes.STRING(20), validate: { isIn: [Object.keys(ESTILOS)] } },
  descricao: { type: DataTypes.TEXT, allowNull: false, validate: { notEmpty: true } },
  orcamento_min: { type: DataTypes.DECIMAL(12, 2), validate: { min: 0 } },
  orcamento_max: { type: DataTypes.DECIMAL(12, 2), validate: { min: 0 } },
  status: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'aguardando_contato',
    validate: { isIn: [Object.keys(STATUS)] },
  },
});

/**
 * Gera um protocolo legivel e unico, ex.: SOL-20261105-4F7A
 */
Solicitacao.gerarProtocolo = () => {
  const data = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sufixo = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `SOL-${data}-${sufixo}`;
};

/**
 * Abre uma nova solicitacao: grava os dados, o primeiro registro do
 * historico de status e envia os anexos para o Storage (RF 04, 10 e 15).
 *
 * @param {number} clienteId
 * @param {object} campos   - req.body do formulario
 * @param {object} arquivos - req.files do multer
 */
Solicitacao.abrir = async (clienteId, campos, arquivos) => {
  // require aqui para evitar dependencia circular entre models
  const HistoricoStatus = require('./HistoricoStatus');
  const SolicitacaoAnexo = require('./SolicitacaoAnexo');
  const valorOuNulo = (v) => (v === undefined || v === '' ? null : v);

  const solicitacao = await Solicitacao.create({
    protocolo: Solicitacao.gerarProtocolo(),
    cliente_id: clienteId,
    produto_id: valorOuNulo(campos.produto_id),
    espaco: campos.espaco,
    estilo: valorOuNulo(campos.estilo),
    descricao: campos.descricao,
    orcamento_min: valorOuNulo(campos.orcamento_min),
    orcamento_max: valorOuNulo(campos.orcamento_max),
  });

  await HistoricoStatus.registrar({
    entidade: 'solicitacao',
    entidade_id: solicitacao.id,
    status_novo: solicitacao.status,
    observacao: 'Solicitação enviada pelo site',
  });

  await SolicitacaoAnexo.enviarArquivos(solicitacao.id, arquivos);
  return solicitacao;
};

module.exports = Solicitacao;
