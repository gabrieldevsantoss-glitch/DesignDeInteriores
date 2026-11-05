/**
 * Listas fixas do dominio (status, espacos, perfis...).
 * Ficam centralizadas aqui para que models, controllers e views
 * usem sempre os mesmos valores e rotulos.
 */

// RF 07 - status de solicitacoes e pedidos (valor no banco -> rotulo na tela)
const STATUS = {
  aguardando_contato: 'Aguardando contato',
  encaminhado_atendente: 'Encaminhado ao atendente',
  cliente_contatado: 'Cliente contatado',
  em_negociacao: 'Em negociação',
  confirmado: 'Confirmado',
  em_preparacao: 'Em preparação',
  em_transporte: 'Em transporte',
  concluido: 'Concluído',
  necessita_acompanhamento: 'Necessita de acompanhamento',
};

// RF 15 - espacos que o cliente pode escolher no formulario
const ESPACOS = {
  sala: 'Sala',
  cozinha: 'Cozinha',
  quarto: 'Quarto',
  banheiro: 'Banheiro',
  escritorio: 'Escritório',
  area_externa: 'Área externa',
  outro: 'Outro',
};

// Estilo de decoracao desejado (campo "tipo de estilo" do formulario de contato)
const ESTILOS = {
  moderno: 'Moderno',
  classico: 'Clássico',
  minimalista: 'Minimalista',
  industrial: 'Industrial',
  rustico: 'Rústico',
  escandinavo: 'Escandinavo',
  contemporaneo: 'Contemporâneo',
  outro: 'Outro',
};

// RF 13 - perfis de funcionario
const PERFIS = {
  admin: 'Administrador',
  vendedor: 'Vendedor',
};

// RF 09 - canais de interacao com o cliente
const CANAIS = {
  nota: 'Nota interna',
  ligacao: 'Ligação',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  visita: 'Visita',
  mensagem: 'Mensagem do cliente',
};

const TIPOS_PRODUTO = { produto: 'Produto', servico: 'Serviço' };
const TIPOS_ANEXO = { referencia: 'Referência / inspiração', planta: 'Planta do ambiente' };

module.exports = { STATUS, ESPACOS, ESTILOS, PERFIS, CANAIS, TIPOS_PRODUTO, TIPOS_ANEXO };
