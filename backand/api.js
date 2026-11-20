// Ponto de entrada do servidor
//  - /api/...  -> rotas da API (respondem em JSON)
//  - o resto   -> arquivos do site (pasta frontend: HTML, CSS, JS e imagens)
import './config/env.js'; // precisa ser o primeiro import (carrega o .env)
import express from 'express';
import cors from 'cors';
import path from 'path';
import sequelize from './model/connect.js';
import rotas from './routes/rotas.js';

const app = express();
const porta = process.env.PORT || 3000;

app.use(express.json()); // le o corpo das requisicoes em JSON

// Permite que o app (Casa&EstiloAPP) chame a API de outro endereco.
// O login continua obrigatorio: sem token, as rotas protegidas recusam.
app.use(cors({ origin: '*' }));

// Site (frontend)
const pastaFrontend = path.join(import.meta.dirname, '..', 'frontend');
app.use(express.static(pastaFrontend));

// API
app.use('/api', rotas);

// Testa a conexao com o banco antes de ligar o servidor
sequelize.authenticate()
    .then(() => {
        app.listen(porta, () => {
            console.log(`app rodando em http://localhost:${porta}`);
        });
    })
    .catch((error) => {
        console.log('Erro ao conectar no banco. Confira o DATABASE_URL no .env');
        console.log(error.message);
    });
