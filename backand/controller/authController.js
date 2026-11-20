// Login, cadastro de cliente e "quem sou eu"
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { Funcionario, Cliente } from '../model/index.js';

// POST /api/logar   { email, senha }
export async function logar(req, res) {
    try {
        const email = req.body.email;
        const senha = req.body.senha;

        const { data, error } = await supabase.auth.signInWithPassword({ email: email, password: senha });
        if (error) {
            return res.status(400).json({ message: 'E-mail ou senha inválidos' });
        }

        // Descobre se quem entrou e administrador ou cliente
        const authId = data.user.id;
        const funcionario = await Funcionario.findOne({ where: { auth_id: authId, ativo: true } });
        const cliente = await Cliente.findOne({ where: { auth_id: authId } });

        let tipo = null;
        let nome = '';
        if (funcionario) {
            tipo = 'admin';
            nome = funcionario.nome;
        } else if (cliente) {
            tipo = 'cliente';
            nome = cliente.nome;
        } else {
            return res.status(400).json({ message: 'Usuário sem acesso ao sistema' });
        }

        console.log(`Usuário ${nome} (${tipo}) logado!`);
        // O token vai para o navegador, que guarda no localStorage
        res.status(200).json({ token: data.session.access_token, tipo: tipo, nome: nome });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// POST /api/cadastro   { nome, email, telefone, endereco, senha }
export async function cadastrar(req, res) {
    try {
        const { nome, email, telefone, endereco, senha } = req.body;

        if (!nome || !email || !senha) {
            return res.status(400).json({ message: 'Preencha nome, e-mail e senha' });
        }
        if (senha.length < 6) {
            return res.status(400).json({ message: 'A senha deve ter pelo menos 6 caracteres' });
        }

        const jaExiste = await Cliente.findOne({ where: { email: email } });
        if (jaExiste) {
            return res.status(400).json({ message: 'Já existe uma conta com esse e-mail' });
        }

        // Cria o usuario no Supabase Auth (ja confirmado, sem e-mail de confirmacao)
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: senha,
            email_confirm: true
        });
        if (error) {
            return res.status(400).json({ message: error.message });
        }

        // Cria o cliente no banco, ligado ao usuario do Auth
        await Cliente.create({
            auth_id: data.user.id,
            nome: nome,
            email: email,
            telefone: telefone,
            endereco: endereco
        });

        console.log(`Cliente novo cadastrado: ${nome}`);
        res.status(201).json({ message: 'Conta criada com sucesso!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// GET /api/eu   -> dados de quem esta logado
export function eu(req, res) {
    res.status(200).json(req.usuario);
}

// GET /api/meus-dados   (cliente) -> cadastro do cliente logado
// Usado para preencher o formulario de contato
export async function meusDados(req, res) {
    try {
        const cliente = await Cliente.findByPk(req.usuario.id, {
            attributes: ['nome', 'email', 'telefone', 'endereco']
        });
        res.status(200).json(cliente);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
