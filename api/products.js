const express = require('express');
const router = express.Router();

// Rotas de produtos (mockadas para desenvolvimento)
router.get('/', (req, res) => {
    const products = [
        { id: 1, name: 'Hambúrguer Clássico', price: 25.00, category: 'Lanches', stock: 50 },
        { id: 2, name: 'Pizza Margherita', price: 45.00, category: 'Pizzas', stock: 30 },
        { id: 3, name: 'Salada Caesar', price: 22.00, category: 'Saladas', stock: 25 },
        { id: 4, name: 'Batata Frita', price: 10.00, category: 'Acompanhamentos', stock: 100 },
        { id: 5, name: 'Refrigerante', price: 5.00, category: 'Bebidas', stock: 200 }
    ];

    res.json({
        success: true,
        data: products
    });
});

router.post('/', (req, res) => {
    // Criar produto (implementar depois)
    res.json({
        success: true,
        message: 'Funcionalidade em desenvolvimento'
    });
});

module.exports = router;