/**
 * Rotas do painel administrativo (/painel).
 * Todas exigem funcionario logado; algumas exigem perfil admin (RF 13).
 */
const { Router } = require('express');
const { exigirFuncionario, exigirPerfil } = require('../middleware/auth');
const painel = require('../controller/painelController');
const solicitacoes = require('../controller/solicitacaoController');
const pedidos = require('../controller/pedidoController');
const clientes = require('../controller/clienteController');
const interacoes = require('../controller/interacaoController');
const produtos = require('../controller/produtoController');
const estoque = require('../controller/estoqueController');
const funcionarios = require('../controller/funcionarioController');

const router = Router();
const somenteAdmin = exigirPerfil('admin');

router.use(exigirFuncionario);

// Dashboard
router.get('/', painel.dashboard);
router.get('/mais', painel.mais);

// Solicitacoes
router.get('/solicitacoes', solicitacoes.listar);
router.get('/solicitacoes/:id', solicitacoes.ver);
router.post('/solicitacoes/:id/assumir', solicitacoes.assumir);
router.post('/solicitacoes/:id/encaminhar', somenteAdmin, solicitacoes.encaminhar);
router.post('/solicitacoes/:id/status', solicitacoes.alterarStatus);

// Pedidos
router.get('/pedidos', pedidos.listar);
router.get('/pedidos/novo', pedidos.formNovo);
router.post('/pedidos', pedidos.criar);
router.get('/pedidos/:id', pedidos.ver);
router.post('/pedidos/:id/status', pedidos.alterarStatus);

// Clientes
router.get('/clientes', clientes.listar);
router.get('/clientes/novo', clientes.formNovo);
router.post('/clientes', clientes.criar);
router.get('/clientes/:id', clientes.ver);
router.get('/clientes/:id/editar', clientes.formEditar);
router.post('/clientes/:id', clientes.atualizar);

// Interacoes (historico de contatos)
router.post('/interacoes', interacoes.criar);

// Produtos: todos veem, so admin altera
router.get('/produtos', produtos.listar);
router.get('/produtos/novo', somenteAdmin, produtos.formNovo);
router.post('/produtos', somenteAdmin, produtos.criar);
router.get('/produtos/:id/editar', somenteAdmin, produtos.formEditar);
router.post('/produtos/:id', somenteAdmin, produtos.atualizar);

// Estoque (admin)
router.get('/estoque', somenteAdmin, estoque.listar);
router.post('/estoque', somenteAdmin, estoque.registrar);

// Funcionarios (admin)
router.get('/funcionarios', somenteAdmin, funcionarios.listar);
router.get('/funcionarios/novo', somenteAdmin, funcionarios.formNovo);
router.post('/funcionarios', somenteAdmin, funcionarios.criar);
router.get('/funcionarios/:id/editar', somenteAdmin, funcionarios.formEditar);
router.post('/funcionarios/:id', somenteAdmin, funcionarios.atualizar);

module.exports = router;
