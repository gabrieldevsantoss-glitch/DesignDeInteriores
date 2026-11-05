/**
 * Rotas da area do cliente (/minha-conta). Todas exigem cliente logado.
 */
const { Router } = require('express');
const { exigirCliente } = require('../middleware/auth');
const { uploadAnexos } = require('../middleware/upload');
const conta = require('../controller/minhaContaController');

const router = Router();
router.use(exigirCliente);

router.get('/', conta.painel);
router.get('/perfil', conta.formPerfil);
router.post('/perfil', conta.atualizarPerfil);

router.get('/solicitacoes/nova', conta.formSolicitacao);
router.post('/solicitacoes', uploadAnexos, conta.criarSolicitacao);
router.get('/solicitacoes/:id', conta.verSolicitacao);
router.post('/solicitacoes/:id/mensagens', conta.enviarMensagem);

router.get('/pedidos/:id', conta.verPedido);

module.exports = router;
