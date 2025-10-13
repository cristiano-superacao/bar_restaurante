const express = require('express');
const router = express.Router();

// Rotas de pedidos (mockadas para desenvolvimento)
router.get('/', (req, res) => {
    const orders = [
        {
            id: 'P001',
            table: 5,
            status: 'preparing',
            items: [
                { name: 'Hambúrguer Clássico', quantity: 2, price: 25.00 },
                { name: 'Batata Frita', quantity: 2, price: 10.00 }
            ],
            total: 70.00,
            created_at: new Date().toISOString()
        },
        {
            id: 'P002',
            table: 3,
            status: 'ready',
            items: [
                { name: 'Pizza Margherita', quantity: 1, price: 45.00 }
            ],
            total: 45.00,
            created_at: new Date(Date.now() - 1800000).toISOString()
        }
    ];

    res.json({
        success: true,
        data: orders
    });
});

router.post('/', (req, res) => {
    // Criar pedido (implementar depois)
    res.json({
        success: true,
        message: 'Funcionalidade em desenvolvimento'
    });
});

module.exports = router;