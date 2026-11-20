// Conexao com o Supabase (usado so para login e cadastro de usuarios)
import { createClient } from '@supabase/supabase-js';

const opcoes = { auth: { persistSession: false } };

// Cliente com a chave publica: faz o login
export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    opcoes
);

// Cliente com a chave secreta (service_role): cria usuarios.
// So pode ser usado aqui no servidor, nunca no navegador!
export const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    opcoes
);
