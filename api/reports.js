const express = require('express');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Dashboard - estatísticas gerais
router.get('/dashboard', async (req, res) => {
    try {
        let dashboardData = {};

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Vendas do dia
            const todaySales = await sql`
                SELECT COALESCE(SUM(total_amount), 0) as total
                FROM sales
                WHERE DATE(created_at) = CURRENT_DATE
                AND status = 'completed'
            `;

            // Pedidos por status
            const orderStats = await sql`
                SELECT status, COUNT(*) as count
                FROM orders
                WHERE DATE(created_at) = CURRENT_DATE
                GROUP BY status
            `;

            // Produtos mais vendidos (últimos 7 dias)
            const topProducts = await sql`
                SELECT si.product_name, SUM(si.quantity) as total_quantity, SUM(si.total_price) as total_revenue
                FROM sale_items si
                JOIN sales s ON si.sale_id = s.id
                WHERE s.created_at >= NOW() - INTERVAL '7 days'
                AND s.status = 'completed'
                GROUP BY si.product_name
                ORDER BY total_quantity DESC
                LIMIT 5
            `;

            // Vendas dos últimos 7 dias
            const weekSales = await sql`
                SELECT DATE(created_at) as date, SUM(total_amount) as total
                FROM sales
                WHERE created_at >= NOW() - INTERVAL '7 days'
                AND status = 'completed'
                GROUP BY DATE(created_at)
                ORDER BY date
            `;

            dashboardData = {
                today: {
                    sales: parseFloat(todaySales[0].total || 0),
                    orders: orderStats.reduce((sum, s) => sum + parseInt(s.count), 0),
                    customers: 0 // Pode ser calculado se houver customer_id nas vendas
                },
                salesChart: {
                    labels: weekSales.map(d => new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' })),
                    data: weekSales.map(d => parseFloat(d.total))
                },
                topProducts: topProducts.map(p => ({
                    name: p.product_name,
                    quantity: parseInt(p.total_quantity),
                    revenue: parseFloat(p.total_revenue)
                })),
                ordersByStatus: {
                    pending: parseInt(orderStats.find(s => s.status === 'pending')?.count || 0),
                    preparing: parseInt(orderStats.find(s => s.status === 'preparing')?.count || 0),
                    ready: parseInt(orderStats.find(s => s.status === 'ready')?.count || 0),
                    delivered: parseInt(orderStats.find(s => s.status === 'delivered')?.count || 0)
                }
            };
        } else {
            // Dados mockados para desenvolvimento
            dashboardData = {
                today: {
                    sales: 2450.00,
                    orders: 23,
                    customers: 45,
                    growth: 15
                },
                salesChart: {
                    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                    data: [1200, 1900, 800, 1500, 2000, 2400, 1800]
                },
                topProducts: [
                    { name: 'Hambúrguer', quantity: 30, revenue: 750.00 },
                    { name: 'Pizza', quantity: 25, revenue: 1125.00 },
                    { name: 'Salada', quantity: 15, revenue: 330.00 },
                    { name: 'Bebidas', quantity: 50, revenue: 250.00 },
                    { name: 'Sobremesas', quantity: 10, revenue: 120.00 }
                ],
                ordersByStatus: {
                    pending: 5,
                    preparing: 8,
                    ready: 3,
                    delivered: 7
                }
            };
        }

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Relatório financeiro
router.get('/financial', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let financialData = {};

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Receitas (vendas)
            const revenueQuery = startDate && endDate
                ? sql`
                    SELECT 
                        SUM(total_amount) as total_revenue,
                        COUNT(*) as total_sales,
                        AVG(total_amount) as avg_sale
                    FROM sales
                    WHERE created_at BETWEEN ${startDate} AND ${endDate}
                    AND status = 'completed'
                `
                : sql`
                    SELECT 
                        SUM(total_amount) as total_revenue,
                        COUNT(*) as total_sales,
                        AVG(total_amount) as avg_sale
                    FROM sales
                    WHERE DATE(created_at) = CURRENT_DATE
                    AND status = 'completed'
                `;

            const revenue = await revenueQuery;

            // Despesas
            const expensesQuery = startDate && endDate
                ? sql`
                    SELECT 
                        SUM(amount) as total_expenses,
                        category,
                        COUNT(*) as count
                    FROM expenses
                    WHERE expense_date BETWEEN ${startDate} AND ${endDate}
                    GROUP BY category
                `
                : sql`
                    SELECT 
                        SUM(amount) as total_expenses,
                        category,
                        COUNT(*) as count
                    FROM expenses
                    WHERE expense_date = CURRENT_DATE
                    GROUP BY category
                `;

            const expenses = await expensesQuery;

            const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.total_expenses || 0), 0);
            const totalRevenue = parseFloat(revenue[0].total_revenue || 0);

            financialData = {
                revenue: {
                    total: totalRevenue,
                    count: parseInt(revenue[0].total_sales || 0),
                    average: parseFloat(revenue[0].avg_sale || 0)
                },
                expenses: {
                    total: totalExpenses,
                    byCategory: expenses.map(e => ({
                        category: e.category,
                        amount: parseFloat(e.total_expenses),
                        count: parseInt(e.count)
                    }))
                },
                profit: totalRevenue - totalExpenses,
                profitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue * 100).toFixed(2) : 0
            };
        } else {
            // Dados mockados
            financialData = {
                revenue: {
                    total: 5000.00,
                    count: 50,
                    average: 100.00
                },
                expenses: {
                    total: 2000.00,
                    byCategory: [
                        { category: 'supplies', amount: 800.00, count: 5 },
                        { category: 'utilities', amount: 600.00, count: 3 },
                        { category: 'salaries', amount: 600.00, count: 1 }
                    ]
                },
                profit: 3000.00,
                profitMargin: 60.00
            };
        }

        res.json({
            success: true,
            data: financialData
        });

    } catch (error) {
        console.error('Erro ao buscar relatório financeiro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Relatório de vendas
router.get('/sales', async (req, res) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        let salesData = {};

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Vendas por período
            const salesQuery = startDate && endDate
                ? sql`
                    SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as count,
                        SUM(total_amount) as total,
                        AVG(total_amount) as average
                    FROM sales
                    WHERE created_at BETWEEN ${startDate} AND ${endDate}
                    AND status = 'completed'
                    GROUP BY DATE(created_at)
                    ORDER BY date
                `
                : sql`
                    SELECT 
                        DATE(created_at) as date,
                        COUNT(*) as count,
                        SUM(total_amount) as total,
                        AVG(total_amount) as average
                    FROM sales
                    WHERE created_at >= NOW() - INTERVAL '30 days'
                    AND status = 'completed'
                    GROUP BY DATE(created_at)
                    ORDER BY date
                `;

            const sales = await salesQuery;

            // Vendas por método de pagamento
            const paymentMethods = await sql`
                SELECT 
                    payment_method,
                    COUNT(*) as count,
                    SUM(total_amount) as total
                FROM sales
                WHERE status = 'completed'
                ${startDate && endDate ? sql`AND created_at BETWEEN ${startDate} AND ${endDate}` : sql``}
                GROUP BY payment_method
            `;

            salesData = {
                byDate: sales.map(s => ({
                    date: s.date,
                    count: parseInt(s.count),
                    total: parseFloat(s.total),
                    average: parseFloat(s.average)
                })),
                byPaymentMethod: paymentMethods.map(pm => ({
                    method: pm.payment_method,
                    count: parseInt(pm.count),
                    total: parseFloat(pm.total)
                }))
            };
        } else {
            // Dados mockados
            salesData = {
                byDate: [
                    { date: '2024-01-01', count: 10, total: 1000.00, average: 100.00 },
                    { date: '2024-01-02', count: 15, total: 1500.00, average: 100.00 }
                ],
                byPaymentMethod: [
                    { method: 'card', count: 15, total: 1500.00 },
                    { method: 'cash', count: 8, total: 800.00 },
                    { method: 'pix', count: 5, total: 500.00 }
                ]
            };
        }

        res.json({
            success: true,
            data: salesData
        });

    } catch (error) {
        console.error('Erro ao buscar relatório de vendas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Relatório de estoque
router.get('/inventory', async (req, res) => {
    try {
        let inventoryData = {};

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Produtos com estoque baixo
            const lowStock = await sql`
                SELECT id, name, stock_quantity, min_stock
                FROM products
                WHERE stock_quantity <= min_stock
                AND active = true
                ORDER BY stock_quantity
            `;

            // Movimentações recentes
            const recentMovements = await sql`
                SELECT sm.*, p.name as product_name
                FROM stock_movements sm
                JOIN products p ON sm.product_id = p.id
                ORDER BY sm.created_at DESC
                LIMIT 20
            `;

            inventoryData = {
                lowStock: lowStock.map(p => ({
                    id: p.id,
                    name: p.name,
                    current: p.stock_quantity,
                    minimum: p.min_stock
                })),
                recentMovements: recentMovements.map(m => ({
                    id: m.id,
                    product: m.product_name,
                    type: m.type,
                    quantity: m.quantity,
                    reason: m.reason,
                    date: m.created_at
                }))
            };
        } else {
            // Dados mockados
            inventoryData = {
                lowStock: [
                    { id: 1, name: 'Hambúrguer', current: 5, minimum: 10 },
                    { id: 2, name: 'Pizza', current: 3, minimum: 5 }
                ],
                recentMovements: [
                    { id: 1, product: 'Hambúrguer', type: 'out', quantity: 5, reason: 'sale', date: new Date().toISOString() }
                ]
            };
        }

        res.json({
            success: true,
            data: inventoryData
        });

    } catch (error) {
        console.error('Erro ao buscar relatório de estoque:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;