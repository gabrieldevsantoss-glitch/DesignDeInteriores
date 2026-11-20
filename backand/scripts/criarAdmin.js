// Cria um administrador do sistema.
// Uso: npm run criar-admin -- "Nome do Admin" email@empresa.com senha123
import '../config/env.js';
import { supabaseAdmin } from '../config/supabase.js';
import { Funcionario } from '../model/index.js';
import sequelize from '../model/connect.js';

const nome = process.argv[2];
const email = process.argv[3];
const senha = process.argv[4];

if (!nome || !email || !senha) {
    console.log('Uso: npm run criar-admin -- "Nome" email@empresa.com senha');
    process.exit(1);
}

try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: senha,
        email_confirm: true
    });
    if (error) throw new Error(error.message);

    await Funcionario.create({ auth_id: data.user.id, nome: nome, email: email, perfil: 'admin' });
    console.log(`Administrador ${email} criado! Entre pelo /login.html`);
} catch (error) {
    console.log('Erro:', error.message);
}

await sequelize.close();
