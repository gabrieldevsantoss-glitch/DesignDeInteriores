// Solicitacoes: o cliente envia e consulta; o administrador gerencia
import { Solicitacao, Cliente, Produto } from '../model/index.js';
import { STATUS } from '../model/Solicitacao.js';

// Gera um codigo para o cliente acompanhar, ex.: SOL-4F7A2C
function gerarProtocolo() {
    const codigo = Math.random().toString(16).slice(2, 8).toUpperCase();
    return 'SOL-' + codigo;
}

// POST /api/solicitacoes   (cliente)  { espaco, estilo, produto_id, orcamento_min, orcamento_max, descricao }
export async function criar(req, res) {
    try {
        const { espaco, estilo, produto_id, orcamento_min, orcamento_max, descricao } = req.body;

        if (!espaco || !descricao) {
            return res.status(400).json({ message: 'Escolha o cômodo e descreva o espaço' });
        }

        const solicitacao = await Solicitacao.create({
            protocolo: gerarProtocolo(),
            cliente_id: req.usuario.id,
            espaco: espaco,
            estilo: estilo || null,
            produto_id: produto_id || null,
            orcamento_min: orcamento_min || null,
            orcamento_max: orcamento_max || null,
            descricao: descricao
        });

        console.log(`Nova solicitação ${solicitacao.protocolo} de ${req.usuario.nome}`);
        res.status(201).json(solicitacao);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// GET /api/minhas-solicitacoes   (cliente) -> so as do cliente logado
export async function minhas(req, res) {
    try {
        const solicitacoes = await Solicitacao.findAll({
            where: { cliente_id: req.usuario.id },
            include: [{ model: Produto, as: 'produto', attributes: ['nome'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(solicitacoes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// GET /api/solicitacoes   (administrador) -> todas, com os dados do cliente
export async function listar(req, res) {
    try {
        const solicitacoes = await Solicitacao.findAll({
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nome', 'email', 'telefone', 'endereco'] },
                { model: Produto, as: 'produto', attributes: ['nome'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(solicitacoes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// PUT /api/solicitacoes/:id/status   (administrador)  { status }
export async function alterarStatus(req, res) {
    try {
        const novoStatus = req.body.status;
        if (!STATUS.includes(novoStatus)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        const solicitacao = await Solicitacao.findByPk(req.params.id);
        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitação não encontrada' });
        }

        solicitacao.status = novoStatus;
        await solicitacao.save();

        res.status(200).json({ message: 'Status atualizado!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
