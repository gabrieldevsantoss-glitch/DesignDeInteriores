-- =====================================================================
-- Dados de exemplo do catalogo (produtos e servicos).
-- Opcional: serve para a vitrine da pagina inicial nao ficar vazia.
-- =====================================================================
insert into public.produtos (nome, descricao, tipo, categoria, preco, quantidade_estoque, estoque_minimo) values
  ('Armário aéreo de cozinha', 'Módulo aéreo em MDF com portas basculantes.', 'produto', 'Cozinha', 1290.00, 8, 3),
  ('Balcão com cooktop', 'Balcão inferior com nicho para cooktop e gavetas.', 'produto', 'Cozinha', 2450.00, 4, 2),
  ('Painel para TV', 'Painel ripado com prateleiras e passagem de fios.', 'produto', 'Sala', 1890.00, 6, 2),
  ('Rack suspenso', 'Rack flutuante com gavetas push-to-open.', 'produto', 'Sala', 980.00, 2, 3),
  ('Guarda-roupa 4 portas', 'Guarda-roupa com portas de correr e espelho.', 'produto', 'Quarto', 3200.00, 3, 1),
  ('Cabeceira estofada', 'Cabeceira sob medida com iluminação indireta.', 'produto', 'Quarto', 1150.00, 5, 2),
  ('Mesa de home office', 'Mesa com gaveteiro e calha para cabos.', 'produto', 'Escritório', 870.00, 7, 2),
  ('Projeto de interiores', 'Projeto 3D completo do ambiente com visita técnica.', 'servico', 'Projeto', 1500.00, 0, 0),
  ('Montagem e instalação', 'Montagem dos móveis planejados no local.', 'servico', 'Instalação', 450.00, 0, 0);

-- Registra o estoque inicial como movimentacao de entrada (historico completo)
insert into public.movimentacoes_estoque (produto_id, tipo, quantidade, motivo)
select id, 'entrada', quantidade_estoque, 'Estoque inicial'
from public.produtos
where tipo = 'produto' and quantidade_estoque > 0;
