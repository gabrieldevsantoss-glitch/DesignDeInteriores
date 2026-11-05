/**
 * Model SolicitacaoAnexo (RF 15)
 * Imagens de referencia ou plantas enviadas pelo cliente.
 * O arquivo fica no Supabase Storage; aqui guardamos so o caminho.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('./connect');
const { TIPOS_ANEXO } = require('../config/constantes');
const { supabaseAdmin, BUCKET_ANEXOS } = require('../config/supabase');

// Extensao do arquivo salvo, definida pelo tipo (nao pelo nome enviado)
const EXTENSOES = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
};

const SolicitacaoAnexo = sequelize.define('solicitacao_anexos', {
  id: { type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
  solicitacao_id: { type: DataTypes.BIGINT, allowNull: false },
  tipo: {
    type: DataTypes.STRING(12),
    allowNull: false,
    defaultValue: 'referencia',
    validate: { isIn: [Object.keys(TIPOS_ANEXO)] },
  },
  caminho: { type: DataTypes.STRING(300), allowNull: false },
  nome_original: { type: DataTypes.STRING(200) },
}, { updatedAt: false });

/**
 * Envia os arquivos recebidos pelo multer para o Supabase Storage
 * e grava um registro para cada um.
 *
 * @param {number} solicitacaoId
 * @param {object} arquivos - req.files ({ referencias: [...], planta: [...] })
 */
SolicitacaoAnexo.enviarArquivos = async (solicitacaoId, arquivos = {}) => {
  const lista = [
    ...(arquivos.referencias || []).map((f) => ({ arquivo: f, tipo: 'referencia' })),
    ...(arquivos.planta || []).map((f) => ({ arquivo: f, tipo: 'planta' })),
  ];

  for (const { arquivo, tipo } of lista) {
    // Nome unico: solicitacao/timestamp-aleatorio.extensao
    const extensao = EXTENSOES[arquivo.mimetype] || 'bin';
    const caminho = `${solicitacaoId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extensao}`;

    const { error } = await supabaseAdmin.storage
      .from(BUCKET_ANEXOS)
      .upload(caminho, arquivo.buffer, { contentType: arquivo.mimetype });
    if (error) throw new Error(`Falha ao enviar arquivo: ${error.message}`);

    await SolicitacaoAnexo.create({
      solicitacao_id: solicitacaoId,
      tipo,
      caminho,
      nome_original: arquivo.originalname,
    });
  }
};

/**
 * O bucket e privado: gera links temporarios (1 hora) para exibir os anexos.
 * Retorna objetos simples { id, tipo, nome_original, url, ehImagem }.
 */
SolicitacaoAnexo.comLinks = async (anexos = []) => {
  if (!anexos.length) return [];

  const { data } = await supabaseAdmin.storage
    .from(BUCKET_ANEXOS)
    .createSignedUrls(anexos.map((a) => a.caminho), 60 * 60);

  return anexos.map((anexo, i) => ({
    id: anexo.id,
    tipo: anexo.tipo,
    nome_original: anexo.nome_original,
    url: data?.[i]?.signedUrl || null,
    ehImagem: !anexo.caminho.endsWith('.pdf'),
  }));
};

module.exports = SolicitacaoAnexo;
