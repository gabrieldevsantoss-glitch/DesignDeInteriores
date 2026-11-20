// Tabela "solicitacoes": pedidos de projeto enviados pelo formulario do site
import { DataTypes } from 'sequelize';
import sequelize from './connect.js';

// Status possiveis de uma solicitacao ou pedido
export const STATUS = [
    'aguardando_contato',
    'encaminhado_atendente',
    'cliente_contatado',
    'em_negociacao',
    'confirmado',
    'em_preparacao',
    'em_transporte',
    'concluido',
    'necessita_acompanhamento'
];

const Solicitacao = sequelize.define('solicitacoes', {
    id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    protocolo: { type: DataTypes.STRING, allowNull: false },
    cliente_id: { type: DataTypes.BIGINT, allowNull: false },
    produto_id: { type: DataTypes.BIGINT },
    espaco: { type: DataTypes.STRING, allowNull: false },   // comodo: sala, cozinha...
    estilo: { type: DataTypes.STRING },
    descricao: { type: DataTypes.TEXT, allowNull: false },
    orcamento_min: { type: DataTypes.DECIMAL(12, 2) },
    orcamento_max: { type: DataTypes.DECIMAL(12, 2) },
    status: { type: DataTypes.STRING, defaultValue: 'aguardando_contato' }
});

export default Solicitacao;
