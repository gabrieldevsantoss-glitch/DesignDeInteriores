// Junta todos os models e define os relacionamentos entre as tabelas.
// O "as" e o nome que aparece no JSON (ex.: solicitacao.cliente.nome)
import Cliente from './Cliente.js';
import Funcionario from './Funcionario.js';
import Produto from './Produto.js';
import Solicitacao from './Solicitacao.js';
import Pedido from './Pedido.js';

// Um cliente tem varias solicitacoes e varios pedidos
Solicitacao.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Pedido.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });

// A solicitacao pode citar um produto de interesse
Solicitacao.belongsTo(Produto, { foreignKey: 'produto_id', as: 'produto' });

// O pedido nasce de uma solicitacao
Pedido.belongsTo(Solicitacao, { foreignKey: 'solicitacao_id', as: 'solicitacao' });

export { Cliente, Funcionario, Produto, Solicitacao, Pedido };
