/**
 * Casa&Estilo - ponto de entrada da aplicacao.
 *
 * Arquitetura MVC:
 *   model/       -> Sequelize (tabelas do Supabase) e regras de dados
 *   controller/  -> recebem a requisicao, usam os models e escolhem a view
 *   ../frontend/views -> templates EJS (View)
 *   routes/      -> ligam URLs aos controllers
 *   middleware/  -> autenticacao, upload, mensagens e erros
 */
require('dotenv').config({ quiet: true });

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const { sequelize } = require('./model');
const flash = require('./middleware/flash');
const locals = require('./middleware/locals');
const { carregarUsuario } = require('./middleware/auth');
const { naoEncontrado, tratarErro } = require('./middleware/erros');

const app = express();
const FRONTEND = path.join(__dirname, '..', 'frontend');

// ---------- View engine (EJS) ----------
app.set('view engine', 'ejs');
app.set('views', path.join(FRONTEND, 'views'));

// ---------- Arquivos estaticos (CSS, JS do navegador, imagens/videos) ----------
app.use('/css', express.static(path.join(FRONTEND, 'css')));
app.use('/js', express.static(path.join(FRONTEND, 'js')));
app.use('/assets', express.static(path.join(FRONTEND, 'assets')));

// ---------- Middlewares globais ----------
app.use(express.urlencoded({ extended: true })); // formularios HTML
app.use(cookieParser());
app.use(flash);
app.use(locals);
app.use(carregarUsuario);

// ---------- Rotas ----------
app.use('/', require('./routes/publicas'));
app.use('/minha-conta', require('./routes/minhaConta'));
app.use('/painel', require('./routes/painel'));

// ---------- Erros ----------
app.use(naoEncontrado);
app.use(tratarErro);

// ---------- Inicializacao ----------
const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => {
    app.listen(PORT, () => console.log(`Casa&Estilo rodando em http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('Não foi possível conectar ao banco. Confira DATABASE_URL no .env.');
    console.error(err.message);
    process.exit(1);
  });
