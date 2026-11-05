/**
 * HomeController - pagina publica (canal digital do cliente).
 */
const { Produto } = require('../model');

/** GET / */
async function index(req, res) {
  // Catalogo ativo: usado no carrossel e no formulario de contato
  const produtos = await Produto.findAll({ where: { ativo: true }, order: [['created_at', 'DESC']] });
  res.render('home/index', {
    titulo: 'Início',
    destaques: produtos.slice(0, 10),
    produtos,
  });
}

module.exports = { index };
