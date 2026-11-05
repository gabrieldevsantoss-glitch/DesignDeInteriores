-- =====================================================================
-- Casa&Estilo - Schema do banco de dados (Supabase / PostgreSQL)
-- ---------------------------------------------------------------------
-- Este arquivo documenta a estrutura aplicada no projeto Supabase.
-- A autenticacao fica no Supabase Auth (schema "auth"); as tabelas
-- "funcionarios" e "clientes" apontam para auth.users via auth_id.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Status possiveis para solicitacoes e pedidos (RF 07)
-- Mantido como CHECK em texto para facilitar o uso no Sequelize.
-- ---------------------------------------------------------------------
-- aguardando_contato | encaminhado_atendente | cliente_contatado |
-- em_negociacao | confirmado | em_preparacao | em_transporte |
-- concluido | necessita_acompanhamento

-- ---------------------------------------------------------------------
-- Funcionarios (RF 12 e 13) - usuarios internos com perfil de acesso
-- ---------------------------------------------------------------------
create table public.funcionarios (
  id          bigint generated always as identity primary key,
  auth_id     uuid not null unique references auth.users (id) on delete cascade,
  nome        varchar(120) not null,
  email       varchar(160) not null unique,
  telefone    varchar(20),
  perfil      varchar(20) not null default 'vendedor'
              check (perfil in ('admin', 'vendedor')),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Clientes (RF 01) - podem ter conta (auth_id) ou ser cadastrados
-- manualmente por um funcionario (auth_id nulo)
-- ---------------------------------------------------------------------
create table public.clientes (
  id           bigint generated always as identity primary key,
  auth_id      uuid unique references auth.users (id) on delete set null,
  nome         varchar(120) not null,
  email        varchar(160) not null unique,
  telefone     varchar(20),
  cpf_cnpj     varchar(18),
  endereco     varchar(200),
  cidade       varchar(80),
  estado       char(2),
  cep          varchar(9),
  observacoes  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Produtos e servicos (RF 02) + saldo de estoque (RF 03)
-- ---------------------------------------------------------------------
create table public.produtos (
  id                  bigint generated always as identity primary key,
  nome                varchar(120) not null,
  descricao           text,
  tipo                varchar(10) not null default 'produto'
                      check (tipo in ('produto', 'servico')),
  categoria           varchar(60),
  preco               numeric(12,2) not null default 0 check (preco >= 0),
  quantidade_estoque  integer not null default 0 check (quantidade_estoque >= 0),
  estoque_minimo      integer not null default 0 check (estoque_minimo >= 0),
  ativo               boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Movimentacoes de estoque (RF 03) - entradas e saidas
-- ---------------------------------------------------------------------
create table public.movimentacoes_estoque (
  id              bigint generated always as identity primary key,
  produto_id      bigint not null references public.produtos (id) on delete cascade,
  funcionario_id  bigint references public.funcionarios (id) on delete set null,
  tipo            varchar(10) not null check (tipo in ('entrada', 'saida')),
  quantidade      integer not null check (quantidade > 0),
  motivo          varchar(200),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Solicitacoes dos clientes (RF 04, 08 e 15)
-- ---------------------------------------------------------------------
create table public.solicitacoes (
  id              bigint generated always as identity primary key,
  protocolo       varchar(20) not null unique,
  cliente_id      bigint not null references public.clientes (id) on delete cascade,
  funcionario_id  bigint references public.funcionarios (id) on delete set null, -- responsavel
  produto_id      bigint references public.produtos (id) on delete set null,     -- interesse
  espaco          varchar(20) not null
                  check (espaco in ('sala', 'cozinha', 'quarto', 'banheiro',
                                    'escritorio', 'area_externa', 'outro')),
  estilo          varchar(20)
                  check (estilo in ('moderno', 'classico', 'minimalista', 'industrial',
                                    'rustico', 'escandinavo', 'contemporaneo', 'outro')),
  descricao       text not null,
  orcamento_min   numeric(12,2) check (orcamento_min >= 0),  -- faixa de orcamento
  orcamento_max   numeric(12,2) check (orcamento_max >= 0),  -- informada pelo cliente
  status          varchar(30) not null default 'aguardando_contato'
                  check (status in ('aguardando_contato', 'encaminhado_atendente',
                    'cliente_contatado', 'em_negociacao', 'confirmado', 'em_preparacao',
                    'em_transporte', 'concluido', 'necessita_acompanhamento')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint solicitacoes_faixa_orcamento
    check (orcamento_min is null or orcamento_max is null or orcamento_min <= orcamento_max)
);

-- ---------------------------------------------------------------------
-- Anexos das solicitacoes (RF 15) - arquivos no Supabase Storage
-- ---------------------------------------------------------------------
create table public.solicitacao_anexos (
  id              bigint generated always as identity primary key,
  solicitacao_id  bigint not null references public.solicitacoes (id) on delete cascade,
  tipo            varchar(12) not null default 'referencia'
                  check (tipo in ('referencia', 'planta')),
  caminho         varchar(300) not null,   -- caminho do arquivo no bucket
  nome_original   varchar(200),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Pedidos (RF 05) e seus itens
-- ---------------------------------------------------------------------
create table public.pedidos (
  id                bigint generated always as identity primary key,
  cliente_id        bigint not null references public.clientes (id) on delete cascade,
  solicitacao_id    bigint references public.solicitacoes (id) on delete set null,
  funcionario_id    bigint references public.funcionarios (id) on delete set null,
  status            varchar(30) not null default 'confirmado'
                    check (status in ('aguardando_contato', 'encaminhado_atendente',
                      'cliente_contatado', 'em_negociacao', 'confirmado', 'em_preparacao',
                      'em_transporte', 'concluido', 'necessita_acompanhamento')),
  valor_total       numeric(12,2) not null default 0 check (valor_total >= 0),
  endereco_entrega  varchar(200),
  previsao_entrega  date,
  observacoes       text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.pedido_itens (
  id              bigint generated always as identity primary key,
  pedido_id       bigint not null references public.pedidos (id) on delete cascade,
  produto_id      bigint not null references public.produtos (id) on delete restrict,
  quantidade      integer not null check (quantidade > 0),
  preco_unitario  numeric(12,2) not null check (preco_unitario >= 0)
);

-- ---------------------------------------------------------------------
-- Interacoes entre clientes e funcionarios (RF 09)
-- ---------------------------------------------------------------------
create table public.interacoes (
  id              bigint generated always as identity primary key,
  cliente_id      bigint not null references public.clientes (id) on delete cascade,
  funcionario_id  bigint references public.funcionarios (id) on delete set null,
  solicitacao_id  bigint references public.solicitacoes (id) on delete cascade,
  pedido_id       bigint references public.pedidos (id) on delete cascade,
  canal           varchar(12) not null default 'nota'
                  check (canal in ('nota', 'ligacao', 'email', 'whatsapp', 'visita', 'mensagem')),
  descricao       text not null,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Historico de alteracoes de status (RF 06 e 10)
-- Registra data/hora, responsavel e o que mudou.
-- ---------------------------------------------------------------------
create table public.historico_status (
  id               bigint generated always as identity primary key,
  entidade         varchar(12) not null check (entidade in ('solicitacao', 'pedido')),
  entidade_id      bigint not null,
  status_anterior  varchar(30),
  status_novo      varchar(30) not null,
  funcionario_id   bigint references public.funcionarios (id) on delete set null,
  observacao       varchar(300),
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Indices para as consultas mais comuns (RNF 05)
-- ---------------------------------------------------------------------
create index idx_solicitacoes_cliente     on public.solicitacoes (cliente_id);
create index idx_solicitacoes_funcionario on public.solicitacoes (funcionario_id);
create index idx_solicitacoes_produto     on public.solicitacoes (produto_id);
create index idx_solicitacoes_status      on public.solicitacoes (status);
create index idx_anexos_solicitacao       on public.solicitacao_anexos (solicitacao_id);
create index idx_pedidos_cliente          on public.pedidos (cliente_id);
create index idx_pedidos_solicitacao      on public.pedidos (solicitacao_id);
create index idx_pedidos_funcionario      on public.pedidos (funcionario_id);
create index idx_pedidos_status           on public.pedidos (status);
create index idx_itens_pedido             on public.pedido_itens (pedido_id);
create index idx_itens_produto            on public.pedido_itens (produto_id);
create index idx_mov_produto              on public.movimentacoes_estoque (produto_id);
create index idx_mov_funcionario          on public.movimentacoes_estoque (funcionario_id);
create index idx_interacoes_cliente       on public.interacoes (cliente_id);
create index idx_interacoes_funcionario   on public.interacoes (funcionario_id);
create index idx_interacoes_solicitacao   on public.interacoes (solicitacao_id);
create index idx_interacoes_pedido        on public.interacoes (pedido_id);
create index idx_historico_entidade       on public.historico_status (entidade, entidade_id);
create index idx_historico_funcionario    on public.historico_status (funcionario_id);

-- ---------------------------------------------------------------------
-- Seguranca (RNF 03): RLS ligado em todas as tabelas, sem politicas.
-- Assim a API publica do Supabase (chave anon) NAO le nem grava nada;
-- todo acesso passa pela API Express, que conecta como "postgres".
-- ---------------------------------------------------------------------
alter table public.funcionarios          enable row level security;
alter table public.clientes              enable row level security;
alter table public.produtos              enable row level security;
alter table public.movimentacoes_estoque enable row level security;
alter table public.solicitacoes          enable row level security;
alter table public.solicitacao_anexos    enable row level security;
alter table public.pedidos               enable row level security;
alter table public.pedido_itens          enable row level security;
alter table public.interacoes            enable row level security;
alter table public.historico_status      enable row level security;

-- ---------------------------------------------------------------------
-- Bucket privado para imagens de referencia e plantas (RF 15)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anexos', 'anexos', false, 5242880,
        array['image/png', 'image/jpeg', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
