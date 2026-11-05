# Casa&Estilo — Trabalho 01 (Prática Profissional Integradora)

Sistema para uma empresa de design de móveis: **canal digital do cliente** (site com formulário de contato, status das solicitações e histórico de pedidos) e **painel administrativo** (solicitações, pedidos, clientes, catálogo, estoque e funcionários).

**Tecnologias:** Node.js · Express 5 · EJS · Sequelize · Supabase (PostgreSQL, Auth e Storage) · HTML/CSS/JS puro

## Arquitetura (MVC)

```
Design de interiores/
├── backand/                  → servidor (Model + Controller)
│   ├── server.js             → ponto de entrada
│   ├── config/               → Supabase e constantes (status, cômodos, perfis...)
│   ├── model/                → models Sequelize + regras de dados (connect.js, index.js)
│   ├── controller/           → recebem a requisição, usam os models e renderizam a view
│   ├── routes/               → URLs → controllers (publicas, minhaConta, painel)
│   ├── middleware/           → autenticação/permissão, upload, mensagens, erros
│   ├── database/schema.sql   → estrutura do banco (já aplicada no Supabase)
│   ├── database/seed.sql     → produtos de exemplo (já aplicados)
│   └── scripts/criarAdmin.js → cria o primeiro administrador
└── frontend/                 → View
    ├── views/                → templates EJS (home, auth, minha-conta, painel, partials)
    ├── css/style.css         → estilos (paleta do esboço do Figma)
    ├── js/site.js            → carrossel, slider, itens do pedido
    └── assets/               → vídeo da página inicial
```

## Como rodar

1. Instale as dependências:
   ```bash
   cd backand
   npm install
   ```
2. Complete o arquivo `backand/.env` (URL e chave pública já estão preenchidas):
   - `DATABASE_URL` → Supabase › **Connect** › *Session pooler* (com a senha do banco)
   - `SUPABASE_SERVICE_ROLE_KEY` → Supabase › Project Settings › **API Keys** › `service_role`
3. Crie o primeiro administrador:
   ```bash
   npm run criar-admin -- "Seu Nome" admin@empresa.com suaSenha123
   ```
4. Inicie o servidor e acesse <http://localhost:3000>:
   ```bash
   npm run dev
   ```

## Banco de dados (Supabase)

| Tabela | Requisitos |
|---|---|
| `funcionarios` | RF 12, 13 — usuários internos, perfil `admin` ou `vendedor` |
| `clientes` | RF 01 — com ou sem conta no site |
| `produtos` | RF 02, 03 — produtos e serviços, saldo de estoque |
| `movimentacoes_estoque` | RF 03 — entradas e saídas |
| `solicitacoes` | RF 04, 07, 08, 15 — cômodo, estilo, faixa de orçamento, responsável |
| `solicitacao_anexos` | RF 15 — imagens de referência e plantas (bucket privado `anexos`) |
| `pedidos` / `pedido_itens` | RF 05, 14 |
| `interacoes` | RF 09 — histórico de contatos cliente ↔ funcionário |
| `historico_status` | RF 06, 10 — quem alterou, quando, de qual status para qual |

- Login pelo **Supabase Auth**; os tokens ficam em cookies `httpOnly`.
- **RLS ligado sem políticas** em todas as tabelas: a API pública do Supabase não acessa nada, e todo acesso passa pelo Express.

## Permissões

| Área | Cliente | Vendedor | Admin |
|---|:-:|:-:|:-:|
| Enviar solicitação / ver status e pedidos próprios | ✔ | | |
| Solicitações, pedidos, clientes, interações | | ✔ | ✔ |
| Consultar catálogo | | ✔ | ✔ |
| Cadastrar/editar produtos, estoque, funcionários, encaminhar solicitações | | | ✔ |
