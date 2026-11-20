// Pedidos: o cliente consulta o historico; o administrador cria e gerencia
import { Pedido, Solicitacao, Cliente } from '../model/index.js';
import { STATUS } from '../model/Solicitacao.js';

// GET /api/meus-pedidos   (cliente) -> historico de pedidos do cliente logado
export async function meus(req, res) {
    try {
        const pedidos = await Pedido.findAll({
            where: { cliente_id: req.usuario.id },
            include: [{ model: Solicitacao, as: 'solicitacao', attributes: ['protocolo', 'espaco'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// GET /api/pedidos   (administrador) -> todos os pedidos
export async function listar(req, res) {
    try {
        const pedidos = await Pedido.findAll({
            include: [
                { model: Cliente, as: 'cliente', attributes: ['nome', 'telefone', 'endereco'] },
                { model: Solicitacao, as: 'solicitacao', attributes: ['protocolo', 'espaco'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// POST /api/pedidos   (administrador)  { solicitacao_id, valor_total, previsao_entrega, observacoes }
// Transforma uma solicitacao em pedido
export async function criar(req, res) {
    try {
        const { solicitacao_id, valor_total, previsao_entrega, observacoes } = req.body;

        const solicitacao = await Solicitacao.findByPk(solicitacao_id);
        if (!solicitacao) {
            return res.status(404).json({ message: 'Solicitação não encontrada' });
        }
        if (!valor_total || Number(valor_total) <= 0) {
            return res.status(400).json({ message: 'Informe o valor do pedido' });
        }

        // Cada solicitacao vira no maximo um pedido (evita duplicar com dois cliques)
        const jaTemPedido = await Pedido.findOne({ where: { solicitacao_id: solicitacao.id } });
        if (jaTemPedido) {
            return res.status(400).json({ message: `Esta solicitação já virou o pedido #${jaTemPedido.id}` });
        }

        const pedido = await Pedido.create({
            cliente_id: solicitacao.cliente_id,
            solicitacao_id: solicitacao.id,
            valor_total: valor_total,
            previsao_entrega: previsao_entrega || null,
            observacoes: observacoes
        });

        // A solicitacao passa para "confirmado"
        solicitacao.status = 'confirmado';
        await solicitacao.save();

        console.log(`Pedido #${pedido.id} criado a partir da ${solicitacao.protocolo}`);
        res.status(201).json(pedido);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// PUT /api/pedidos/:id/status   (administrador)  { status }
export async function alterarStatus(req, res) {
    try {
        const novoStatus = req.body.status;
        if (!STATUS.includes(novoStatus)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        const pedido = await Pedido.findByPk(req.params.id);
        if (!pedido) {
            return res.status(404).json({ message: 'Pedido não encontrado' });
        }

        pedido.status = novoStatus;
        await pedido.save();

        res.status(200).json({ message: 'Status do pedido atualizado!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
