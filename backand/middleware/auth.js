// Middlewares de login: conferem quem esta fazendo a requisicao
import { supabase } from '../config/supabase.js';
import { Funcionario, Cliente } from '../model/index.js';

// Confere o token enviado pelo navegador no cabecalho "Authorization"
// e coloca os dados do usuario em req.usuario
export async function verificarLogin(req, res, next) {
    try {
        const cabecalho = req.headers.authorization || '';
        const token = cabecalho.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Faça login para continuar' });
        }

        // Pergunta ao Supabase de quem e esse token
        const { data, error } = await supabase.auth.getUser(token);
        if (error) {
            return res.status(401).json({ message: 'Sessão expirada. Faça login novamente' });
        }

        const authId = data.user.id;

        // E um funcionario (administrador)?
        const funcionario = await Funcionario.findOne({ where: { auth_id: authId, ativo: true } });
        if (funcionario) {
            req.usuario = { tipo: 'admin', id: funcionario.id, nome: funcionario.nome };
            return next();
        }

        // E um cliente?
        const cliente = await Cliente.findOne({ where: { auth_id: authId } });
        if (cliente) {
            req.usuario = { tipo: 'cliente', id: cliente.id, nome: cliente.nome };
            return next();
        }

        res.status(403).json({ message: 'Usuário sem acesso ao sistema' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// Deixa passar so o administrador (usar depois do verificarLogin)
export function somenteAdmin(req, res, next) {
    if (req.usuario.tipo !== 'admin') {
        return res.status(403).json({ message: 'Acesso permitido só para administradores' });
    }
    next();
}

// Deixa passar so o cliente (usar depois do verificarLogin)
export function somenteCliente(req, res, next) {
    if (req.usuario.tipo !== 'cliente') {
        return res.status(403).json({ message: 'Acesso permitido só para clientes' });
    }
    next();
}
