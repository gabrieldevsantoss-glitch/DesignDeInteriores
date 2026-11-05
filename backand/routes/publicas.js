/**
 * Rotas publicas: site, login, cadastro e logout.
 */
const { Router } = require('express');
const home = require('../controller/homeController');
const auth = require('../controller/authController');
const { uploadAnexos } = require('../middleware/upload');

const router = Router();

router.get('/', home.index);

router.get('/login', auth.formLogin);
router.post('/login', auth.login);
router.get('/cadastro', auth.formCadastro);
router.post('/cadastro', auth.cadastrar);
router.post('/logout', auth.logout);

// Formulario "Contato" da pagina inicial (com imagens de referencia/planta)
router.post('/contato', uploadAnexos, auth.contato);

module.exports = router;
