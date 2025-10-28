const express = require('express');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        let products = [];
        
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Buscar no banco de dados
            products = await sql`
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.active = true
                ORDER BY c.name, p.name
            `;
        } else {
            // Dados mockados para desenvolvimento
            products = [
                { id: 1, name: 'Hambúrguer Clássico', price: 25.00, category_name: 'Lanches', stock_quantity: 50, active: true },
                { id: 2, name: 'Pizza Margherita', price: 45.00, category_name: 'Pizzas', stock_quantity: 30, active: true },
                { id: 3, name: 'Salada Caesar', price: 22.00, category_name: 'Saladas', stock_quantity: 25, active: true },
                { id: 4, name: 'Batata Frita', price: 10.00, category_name: 'Acompanhamentos', stock_quantity: 100, active: true },
                { id: 5, name: 'Refrigerante', price: 5.00, category_name: 'Bebidas', stock_quantity: 200, active: true }
            ];
        }

        res.json({
            success: true,
            data: products,
            total: products.length
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar produto por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let product = null;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            const products = await sql`
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE p.id = ${id}
            `;
            product = products[0] || null;
        } else {
            // Dados mockados
            const mockProducts = [
                { id: 1, name: 'Hambúrguer Clássico', price: 25.00, category_name: 'Lanches', stock_quantity: 50 }
            ];
            product = mockProducts.find(p => p.id == id);
        }

        if (!product) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo produto
router.post('/', async (req, res) => {
    try {
        const { name, description, price, cost_price, category_id, stock_quantity, min_stock, barcode } = req.body;

        if (!name || !price) {
            return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
        }

        let productId;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Inserir no banco de dados
            const result = await sql`
                INSERT INTO products (name, description, price, cost_price, category_id, stock_quantity, min_stock, barcode, created_at, updated_at)
                VALUES (${name}, ${description || null}, ${price}, ${cost_price || null}, ${category_id || null}, ${stock_quantity || 0}, ${min_stock || 0}, ${barcode || null}, NOW(), NOW())
                RETURNING id
            `;
            productId = result[0].id;
        } else {
            productId = Math.floor(Math.random() * 1000);
        }

        res.status(201).json({
            success: true,
            message: 'Produto criado com sucesso',
            id: productId
        });

    } catch (error) {
        console.error('Erro ao criar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar produto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, cost_price, category_id, stock_quantity, min_stock, barcode, active } = req.body;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            await sql`
                UPDATE products
                SET name = COALESCE(${name}, name),
                    description = COALESCE(${description}, description),
                    price = COALESCE(${price}, price),
                    cost_price = COALESCE(${cost_price}, cost_price),
                    category_id = COALESCE(${category_id}, category_id),
                    stock_quantity = COALESCE(${stock_quantity}, stock_quantity),
                    min_stock = COALESCE(${min_stock}, min_stock),
                    barcode = COALESCE(${barcode}, barcode),
                    active = COALESCE(${active}, active),
                    updated_at = NOW()
                WHERE id = ${id}
            `;
        }

        res.json({
            success: true,
            message: 'Produto atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar produto (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            await sql`
                UPDATE products
                SET active = false, updated_at = NOW()
                WHERE id = ${id}
            `;
        }

        res.json({
            success: true,
            message: 'Produto desativado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Listar categorias
router.get('/categories/list', async (req, res) => {
    try {
        let categories = [];

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            categories = await sql`
                SELECT * FROM categories
                WHERE active = true
                ORDER BY name
            `;
        } else {
            // Dados mockados
            categories = [
                { id: 1, name: 'Lanches', description: 'Hambúrgueres e sanduíches' },
                { id: 2, name: 'Pizzas', description: 'Pizzas diversas' },
                { id: 3, name: 'Saladas', description: 'Saladas e pratos saudáveis' },
                { id: 4, name: 'Bebidas', description: 'Refrigerantes e sucos' },
                { id: 5, name: 'Sobremesas', description: 'Doces e sobremesas' },
                { id: 6, name: 'Acompanhamentos', description: 'Batatas e porções' }
            ];
        }

        res.json({
            success: true,
            data: categories
        });

    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;