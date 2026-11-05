/**
 * Mensagens "flash": avisos que aparecem uma unica vez depois de um redirect
 * (ex.: "Produto salvo com sucesso"). Guardadas em um cookie de curta duracao.
 *
 * Uso no controller: res.flash('sucesso', 'Texto'); res.redirect(...)
 * Uso na view:       <%= flash.texto %> (ver partials/flash.ejs)
 */
function flash(req, res, next) {
  // Le a mensagem da requisicao anterior e apaga o cookie
  res.locals.flash = null;
  if (req.cookies.flash) {
    try {
      res.locals.flash = JSON.parse(req.cookies.flash);
    } catch {
      res.locals.flash = null;
    }
    res.clearCookie('flash');
  }

  // Grava uma mensagem para a proxima requisicao
  res.flash = (tipo, texto) => {
    res.cookie('flash', JSON.stringify({ tipo, texto }), { httpOnly: true, maxAge: 60 * 1000 });
  };

  next();
}

module.exports = flash;
