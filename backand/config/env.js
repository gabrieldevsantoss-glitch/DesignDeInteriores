// Carrega as variaveis do arquivo .env (senha do banco, chaves do Supabase...)
// Este arquivo precisa ser o PRIMEIRO import do api.js
import dotenv from 'dotenv';

dotenv.config({ quiet: true });
