// Todas as rotas da API. Cada rota chama uma funcao de um controller.
import { Router } from 'express';
import { verificarLogin, somenteAdmin, somenteCliente } from '../middleware/auth.js';
import * as auth from '../controller/authController.js';
import * as produtos from '../controller/produtoController.js';
import * as solicitacoes from '../controller/solicitacaoController.js';
import * as pedidos from '../controller/pedidoController.js';
import * as painel from '../controller/painelController.js';

const rotas = Router();

/* Login e cadastro (abertas) */
rotas.post('/logar', auth.logar);
rotas.post('/cadastro', auth.cadastrar);
rotas.get('/eu', verificarLogin, auth.eu);

/* Produtos */
rotas.get('/produtos', produtos.listar);                                          // site
rotas.post('/produtos', verificarLogin, somenteAdmin, produtos.cadastrar);        // admin
rotas.delete('/produtos/:id', verificarLogin, somenteAdmin, produtos.excluir);    // admin

/* Area do cliente */
rotas.get('/meus-dados', verificarLogin, somenteCliente, auth.meusDados);
rotas.post('/solicitacoes', verificarLogin, somenteCliente, solicitacoes.criar);
rotas.get('/minhas-solicitacoes', verificarLogin, somenteCliente, solicitacoes.minhas);
rotas.get('/meus-pedidos', verificarLogin, somenteCliente, pedidos.meus);

/* Painel do administrador */
rotas.get('/painel', verificarLogin, somenteAdmin, painel.resumo);
rotas.get('/solicitacoes', verificarLogin, somenteAdmin, solicitacoes.listar);
rotas.put('/solicitacoes/:id/status', verificarLogin, somenteAdmin, solicitacoes.alterarStatus);
rotas.get('/pedidos', verificarLogin, somenteAdmin, pedidos.listar);
rotas.post('/pedidos', verificarLogin, somenteAdmin, pedidos.criar);
rotas.put('/pedidos/:id/status', verificarLogin, somenteAdmin, pedidos.alterarStatus);

export default rotas;
