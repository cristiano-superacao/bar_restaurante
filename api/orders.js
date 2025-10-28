const express = require('express');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Listar todos os pedidos
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        let orders = [];

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Buscar no banco de dados
            if (status) {
                orders = await sql`
                    SELECT o.*, 
                           json_agg(
                               json_build_object(
                                   'id', oi.id,
                                   'product_name', oi.product_name,
                                   'quantity', oi.quantity,
                                   'notes', oi.notes,
                                   'status', oi.status
                               )
                           ) as items
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    WHERE o.status = ${status}
                    GROUP BY o.id
                    ORDER BY o.created_at DESC
                `;
            } else {
                orders = await sql`
                    SELECT o.*, 
                           json_agg(
                               json_build_object(
                                   'id', oi.id,
                                   'product_name', oi.product_name,
                                   'quantity', oi.quantity,
                                   'notes', oi.notes,
                                   'status', oi.status
                               )
                           ) as items
                    FROM orders o
                    LEFT JOIN order_items oi ON o.id = oi.order_id
                    GROUP BY o.id
                    ORDER BY o.created_at DESC
                    LIMIT 100
                `;
            }
        } else {
            // Dados mockados para desenvolvimento
            orders = [
                {
                    id: 1,
                    table_number: 5,
                    status: 'preparing',
                    priority: 1,
                    items: [
                        { product_name: 'Hambúrguer Clássico', quantity: 2, status: 'preparing' },
                        { product_name: 'Batata Frita', quantity: 2, status: 'preparing' }
                    ],
                    created_at: new Date().toISOString()
                },
                {
                    id: 2,
                    table_number: 3,
                    status: 'ready',
                    priority: 1,
                    items: [
                        { product_name: 'Pizza Margherita', quantity: 1, status: 'ready' }
                    ],
                    created_at: new Date(Date.now() - 1800000).toISOString()
                }
            ];
        }

        res.json({
            success: true,
            data: orders,
            total: orders.length
        });

    } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar pedido por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let order = null;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            const orders = await sql`
                SELECT o.*, 
                       json_agg(
                           json_build_object(
                               'id', oi.id,
                               'product_name', oi.product_name,
                               'quantity', oi.quantity,
                               'notes', oi.notes,
                               'status', oi.status
                           )
                       ) as items
                FROM orders o
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE o.id = ${id}
                GROUP BY o.id
            `;
            order = orders[0] || null;
        } else {
            // Mock
            order = {
                id: id,
                table_number: 5,
                status: 'preparing',
                items: []
            };
        }

        if (!order) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar novo pedido
router.post('/', async (req, res) => {
    try {
        const { table_number, items, notes, priority } = req.body;

        if (!table_number || !items || items.length === 0) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        let orderId;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Inserir pedido no banco
            const result = await sql`
                INSERT INTO orders (table_number, status, priority, notes, created_at, updated_at)
                VALUES (${table_number}, 'pending', ${priority || 1}, ${notes || null}, NOW(), NOW())
                RETURNING id
            `;
            
            orderId = result[0].id;

            // Inserir itens do pedido
            for (const item of items) {
                await sql`
                    INSERT INTO order_items (order_id, product_id, product_name, quantity, notes, status)
                    VALUES (${orderId}, ${item.product_id || null}, ${item.product_name}, ${item.quantity}, ${item.notes || null}, 'pending')
                `;
            }
        } else {
            // In development mode, generate a simple sequential ID (not security-sensitive)
            orderId = Date.now();
        }

        res.status(201).json({
            success: true,
            message: 'Pedido criado com sucesso',
            id: orderId
        });

    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Atualizar status do pedido
router.put('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'Status é obrigatório' });
        }

        const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            await sql`
                UPDATE orders
                SET status = ${status}, updated_at = NOW()
                WHERE id = ${id}
            `;

            // Atualizar itens também se o pedido está pronto
            if (status === 'ready' || status === 'delivered') {
                await sql`
                    UPDATE order_items
                    SET status = ${status}
                    WHERE order_id = ${id}
                `;
            }
        }

        res.json({
            success: true,
            message: 'Status atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Deletar/cancelar pedido
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            await sql`
                UPDATE orders
                SET status = 'cancelled', updated_at = NOW()
                WHERE id = ${id}
            `;
        }

        res.json({
            success: true,
            message: 'Pedido cancelado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;