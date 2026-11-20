// Painel de gerenciamento: numeros principais para o administrador
import { Solicitacao, Pedido } from '../model/index.js';

// GET /api/painel   (administrador)
export async function resumo(req, res) {
    try {
        const novas = await Solicitacao.count({ where: { status: 'aguardando_contato' } });
        const totalSolicitacoes = await Solicitacao.count();
        const totalPedidos = await Pedido.count();
        const concluidos = await Pedido.count({ where: { status: 'concluido' } });
        const faturado = await Pedido.sum('valor_total', { where: { status: 'concluido' } });

        res.status(200).json({
            novas: novas,
            totalSolicitacoes: totalSolicitacoes,
            pedidosAndamento: totalPedidos - concluidos,
            concluidos: concluidos,
            faturado: faturado || 0
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
