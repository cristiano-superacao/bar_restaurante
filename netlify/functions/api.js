const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
    // Headers CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Responder ao preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Configurar conexão com Neon
        const sql = neon(process.env.DATABASE_URL);

        const path = event.path.replace('/api/', '').replace('/.netlify/functions/', '');
        const method = event.httpMethod;
        
        // Roteamento básico
        if (path.startsWith('auth/login') && method === 'POST') {
            const { username, password } = JSON.parse(event.body || '{}');
            
            // Demo: aceitar qualquer usuário/senha
            if (username && password) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Login realizado com sucesso',
                        token: 'demo-token-' + Date.now(),
                        user: {
                            username: username,
                            loginTime: new Date().toISOString()
                        }
                    })
                };
            } else {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        error: 'Usuário e senha são obrigatórios'
                    })
                };
            }
        }

        // Rota de status da API
        if (path === 'status' && method === 'GET') {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    status: 'OK',
                    message: 'Maria Flor API está funcionando',
                    timestamp: new Date().toISOString(),
                    version: '1.0.0'
                })
            };
        }

        // Vendas mockadas
        if (path === 'sales' && method === 'GET') {
            const mockSales = [
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
                }
            ];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: mockSales,
                    total: mockSales.length
                })
            };
        }

        // Rota não encontrada
        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({
                error: 'Endpoint não encontrado',
                path: path,
                method: method
            })
        };

    } catch (error) {
        console.error('Erro na função:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Erro interno do servidor',
                message: error.message
            })
        };
    }
};