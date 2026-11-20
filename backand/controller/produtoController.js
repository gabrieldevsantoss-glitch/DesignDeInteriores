// Produtos: listar (site) e cadastrar/excluir (administrador)
import { Produto } from '../model/index.js';

// GET /api/produtos   -> produtos ativos (aparecem no site)
export async function listar(req, res) {
    try {
        const produtos = await Produto.findAll({
            where: { ativo: true },
            order: [['nome', 'ASC']]
        });
        res.status(200).json(produtos);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// POST /api/produtos   { nome, descricao, tipo, categoria, preco, quantidade_estoque }
export async function cadastrar(req, res) {
    try {
        const { nome, descricao, tipo, categoria, preco, quantidade_estoque } = req.body;

        if (!nome) {
            return res.status(400).json({ message: 'Informe o nome do produto' });
        }
        if (Number(preco) < 0) {
            return res.status(400).json({ message: 'O preço não pode ser negativo' });
        }

        const produto = await Produto.create({
            nome: nome,
            descricao: descricao,
            tipo: tipo,
            categoria: categoria,
            preco: preco || 0,
            quantidade_estoque: quantidade_estoque || 0
        });

        console.log(`Produto cadastrado: ${nome}`);
        res.status(201).json(produto);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

// DELETE /api/produtos/:id   -> tira o produto do site (nao apaga do banco)
export async function excluir(req, res) {
    try {
        const produto = await Produto.findByPk(req.params.id);
        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        produto.ativo = false;
        await produto.save();

        res.status(200).json({ message: 'Produto removido!' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
