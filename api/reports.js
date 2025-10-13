const express = require('express');
const router = express.Router();

// Relatórios (mockados para desenvolvimento)
router.get('/dashboard', (req, res) => {
    const dashboardData = {
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
            { name: 'Hambúrguer', percentage: 30 },
            { name: 'Pizza', percentage: 25 },
            { name: 'Salada', percentage: 15 },
            { name: 'Bebidas', percentage: 20 },
            { name: 'Sobremesas', percentage: 10 }
        ]
    };

    res.json({
        success: true,
        data: dashboardData
    });
});

router.get('/financial', (req, res) => {
    // Relatório financeiro (implementar depois)
    res.json({
        success: true,
        message: 'Funcionalidade em desenvolvimento'
    });
});

module.exports = router;