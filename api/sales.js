const express = require('express');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Listar todas as vendas
router.get('/', async (req, res) => {
    try {
        let sales = [];
        
        if (process.env.NODE_ENV === 'production') {
            // Buscar no banco de dados
            sales = await sql`
                SELECT s.*, 
                       json_agg(
                           json_build_object(
                               'name', si.product_name,
                               'price', si.price,
                               'quantity', si.quantity
                           )
                       ) as items
                FROM sales s
                LEFT JOIN sale_items si ON s.id = si.sale_id
                GROUP BY s.id
                ORDER BY s.created_at DESC
                LIMIT 100
            `;
        } else {
            // Dados mockados para desenvolvimento
            sales = [
                {
                    id: 'V001',
                    customer_name: 'João Silva',
                    total_amount: 35.00,
                    payment_method: 'card',
                    status: 'completed',
                    created_at: new Date().toISOString(),
                    items: [
                        { name: 'Hambúrguer Clássico', price: 25.00, quantity: 1 },
                        { name: 'Batata Frita', price: 10.00, quantity: 1 }
                    ]
                },
                {
                    id: 'V002',
                    customer_name: 'Maria Santos',
                    total_amount: 45.00,
                    payment_method: 'pix',
                    status: 'completed',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    items: [
                        { name: 'Pizza Margherita', price: 45.00, quantity: 1 }
                    ]
                }
            ];
        }

        res.json({
            success: true,
            data: sales,
            total: sales.length
        });

    } catch (error) {
        console.error('Erro ao buscar vendas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Criar nova venda
router.post('/', async (req, res) => {
    try {
        const { customer_name, items, payment_method } = req.body;

        if (!customer_name || !items || items.length === 0) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        // Calcular total
        const total_amount = items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        let saleId;

        if (process.env.NODE_ENV === 'production') {
            // Inserir no banco de dados
            const result = await sql`
                INSERT INTO sales (customer_name, total_amount, payment_method, status, created_at)
                VALUES (${customer_name}, ${total_amount}, ${payment_method}, 'completed', NOW())
                RETURNING id
            `;
            
            saleId = result[0].id;

            // Inserir itens da venda
            for (const item of items) {
                await sql`
                    INSERT INTO sale_items (sale_id, product_name, price, quantity)
                    VALUES (${saleId}, ${item.name}, ${item.price}, ${item.quantity})
                `;
            }
        } else {
            // Para desenvolvimento, apenas simular
            saleId = `V${String(Date.now()).slice(-3)}`;
        }

        const newSale = {
            id: saleId,
            customer_name,
            total_amount,
            payment_method,
            status: 'completed',
            created_at: new Date().toISOString(),
            items
        };

        res.status(201).json({
            success: true,
            message: 'Venda criada com sucesso',
            data: newSale
        });

    } catch (error) {
        console.error('Erro ao criar venda:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Buscar venda por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let sale = null;

        if (process.env.NODE_ENV === 'production') {
            const results = await sql`
                SELECT s.*, 
                       json_agg(
                           json_build_object(
                               'name', si.product_name,
                               'price', si.price,
                               'quantity', si.quantity
                           )
                       ) as items
                FROM sales s
                LEFT JOIN sale_items si ON s.id = si.sale_id
                WHERE s.id = ${id}
                GROUP BY s.id
            `;
            sale = results[0] || null;
        }

        if (!sale) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        res.json({
            success: true,
            data: sale
        });

    } catch (error) {
        console.error('Erro ao buscar venda:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Relatório de vendas por período
router.get('/reports/period', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'Período é obrigatório' });
        }

        let salesReport = {
            totalSales: 0,
            totalAmount: 0,
            salesByDay: [],
            topProducts: []
        };

        if (process.env.NODE_ENV === 'production') {
            // Buscar relatório no banco
            const results = await sql`
                SELECT 
                    COUNT(*) as total_sales,
                    SUM(total_amount) as total_amount,
                    DATE(created_at) as sale_date,
                    COUNT(*) as daily_count,
                    SUM(total_amount) as daily_amount
                FROM sales 
                WHERE DATE(created_at) BETWEEN ${startDate} AND ${endDate}
                GROUP BY DATE(created_at)
                ORDER BY sale_date
            `;

            salesReport.salesByDay = results;
        } else {
            // Dados mockados
            salesReport = {
                totalSales: 45,
                totalAmount: 2450.00,
                salesByDay: [
                    { sale_date: '2024-10-13', daily_count: 15, daily_amount: 850.00 },
                    { sale_date: '2024-10-12', daily_count: 18, daily_amount: 920.00 },
                    { sale_date: '2024-10-11', daily_count: 12, daily_amount: 680.00 }
                ],
                topProducts: [
                    { product_name: 'Hambúrguer', total_quantity: 25, total_amount: 625.00 },
                    { product_name: 'Pizza', total_quantity: 18, total_amount: 810.00 },
                    { product_name: 'Salada', total_quantity: 12, total_amount: 264.00 }
                ]
            };
        }

        res.json({
            success: true,
            data: salesReport
        });

    } catch (error) {
        console.error('Erro ao gerar relatório:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;