/**
 * Clientes do Supabase usados pela aplicacao.
 *
 * - supabase      -> chave publica (anon). Usado para login (Supabase Auth).
 * - supabaseAdmin -> chave service_role. Usado SOMENTE no servidor para
 *                    criar usuarios e acessar o Storage privado.
 */
const { createClient } = require('@supabase/supabase-js');

// Opcoes comuns: o servidor nao guarda sessao em memoria,
// cada requisicao usa o token que veio no cookie.
const opcoes = {
  auth: { persistSession: false, autoRefreshToken: false },
};

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  opcoes
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  opcoes
);

// Nome do bucket privado criado no schema.sql
const BUCKET_ANEXOS = 'anexos';

module.exports = { supabase, supabaseAdmin, BUCKET_ANEXOS };
