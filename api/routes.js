const express = require('express');
const router = express.Router();

// Importar módulos
const auth = require('./auth');
const sales = require('./sales');
const products = require('./products');
const orders = require('./orders');
const reports = require('./reports');

// Rotas de autenticação
router.use('/auth', auth);

// Rotas protegidas (requerem autenticação)
router.use('/sales', sales);
router.use('/products', products);
router.use('/orders', orders);
router.use('/reports', reports);

// Rota de status
router.get('/status', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Maria Flor API está funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

module.exports = router;