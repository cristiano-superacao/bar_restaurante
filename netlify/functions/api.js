const { 
  userService, 
  menuService, 
  tableService, 
  orderService, 
  salesService, 
  dashboardService 
} = require('../../api/services');

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Usuários padrão para fallback (quando não há banco)
const defaultUsers = [
    {
        id: 1,
        username: 'admin',
        password_hash: bcrypt.hashSync('MariaFlor2025!', 10),
        name: 'Administrador do Sistema',
        role: 'admin',
        permissions: ['*'],
        active: true
    },
    {
        id: 2,
        username: 'gerente',
        password_hash: bcrypt.hashSync('Gerente123!', 10),
        name: 'Gerente Geral',
        role: 'manager',
        permissions: ['dashboard', 'sales', 'orders', 'menu', 'stock', 'financial', 'reports'],
        active: true
    },
    {
        id: 3,
        username: 'garcom1',
        password_hash: bcrypt.hashSync('Garcom123!', 10),
        name: 'Maria Silva - Garçonete',
        role: 'waiter',
        permissions: ['dashboard', 'orders', 'sales', 'menu-view'],
        active: true
    }
];

exports.handler = async (event, context) => {
    // Headers CORS aprimorados
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Max-Age': '86400',
        'Content-Type': 'application/json',
        'X-Powered-By': 'Maria Flor Sistema v2.0'
    };

    // Responder ao preflight (OPTIONS)
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: 'CORS preflight successful' })
        };
    }

    try {
        // Configurar conexão com Neon
        const sql = neon(process.env.DATABASE_URL);

        const path = event.path.replace('/api/', '').replace('/.netlify/functions/', '');
        const method = event.httpMethod;
        
        // Roteamento da API
        console.log(`🚀 API Request: ${method} ${path}`);
        
        // ROTA: Login de usuários
        if (path.startsWith('auth/login') && method === 'POST') {
            try {
                const { username, password } = JSON.parse(event.body || '{}');
                
                if (!username || !password) {
                    return {
                        statusCode: 400,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Usuário e senha são obrigatórios'
                        })
                    };
                }

                // Buscar usuário (banco ou fallback)
                let user = null;
                
                if (sql) {
                    try {
                        const result = await sql`
                            SELECT * FROM users 
                            WHERE username = ${username} AND active = true
                        `;
                        user = result[0];
                    } catch (dbError) {
                        console.log('⚠️ Banco não disponível, usando usuários padrão');
                    }
                }
                
                // Fallback para usuários padrão
                if (!user) {
                    user = defaultUsers.find(u => u.username === username && u.active);
                }

                if (!user) {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Usuário não encontrado'
                        })
                    };
                }

                // Verificar senha
                const passwordValid = user.password_hash ? 
                    bcrypt.compareSync(password, user.password_hash) :
                    password === 'MariaFlor2025!' || password === 'Gerente123!' || password === 'Garcom123!';

                if (!passwordValid) {
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            success: false,
                            error: 'Senha incorreta'
                        })
                    };
                }

                // Gerar token JWT
                const token = jwt.sign(
                    { 
                        userId: user.id, 
                        username: user.username, 
                        role: user.role 
                    },
                    process.env.JWT_SECRET || 'maria-flor-secret-key',
                    { expiresIn: '8h' }
                );

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: `Bem-vindo(a), ${user.name}!`,
                        token: token,
                        user: {
                            id: user.id,
                            username: user.username,
                            name: user.name,
                            role: user.role,
                            permissions: user.permissions,
                            loginTime: new Date().toISOString()
                        }
                    })
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Erro no processo de login',
                        details: error.message
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

        // ROTA: Listar vendas
        if (path === 'sales' && method === 'GET') {
            try {
                let sales = [];
                
                if (sql) {
                    try {
                        sales = await sql`
                            SELECT s.*, 
                                   array_agg(
                                       json_build_object(
                                           'name', si.product_name,
                                           'price', si.unit_price,
                                           'quantity', si.quantity
                                       )
                                   ) as items
                            FROM sales s
                            LEFT JOIN sale_items si ON s.id = si.sale_id
                            GROUP BY s.id
                            ORDER BY s.created_at DESC
                            LIMIT 50
                        `;
                    } catch (dbError) {
                        console.log('⚠️ Usando dados mockados de vendas');
                    }
                }
                
                // Dados mockados como fallback
                if (sales.length === 0) {
                    sales = [
                        {
                            id: 'V001',
                            customer_name: 'João Silva',
                            total_amount: 35.00,
                            payment_method: 'card',
                            status: 'completed',
                            created_at: new Date(Date.now() - 3600000).toISOString(),
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
                            created_at: new Date(Date.now() - 7200000).toISOString(),
                            items: [
                                { name: 'Pizza Margherita', price: 45.00, quantity: 1 }
                            ]
                        }
                    ];
                }

                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: sales,
                        total: sales.length,
                        timestamp: new Date().toISOString()
                    })
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Erro ao buscar vendas',
                        details: error.message
                    })
                };
            }
        }

        // ROTA: Criar nova venda
        if (path === 'sales' && method === 'POST') {
            try {
                const saleData = JSON.parse(event.body || '{}');
                
                const newSale = {
                    id: 'V' + String(Date.now()).slice(-6),
                    customer_name: saleData.customer || 'Cliente',
                    total_amount: saleData.total || 0,
                    payment_method: saleData.paymentMethod || 'cash',
                    status: 'completed',
                    created_at: new Date().toISOString(),
                    items: saleData.items || []
                };

                // TODO: Salvar no banco se disponível
                if (sql) {
                    try {
                        await sql`
                            INSERT INTO sales (id, customer_name, total_amount, payment_method, status)
                            VALUES (${newSale.id}, ${newSale.customer_name}, ${newSale.total_amount}, ${newSale.payment_method}, ${newSale.status})
                        `;
                    } catch (dbError) {
                        console.log('⚠️ Não foi possível salvar no banco, funcionando em modo local');
                    }
                }

                return {
                    statusCode: 201,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        message: 'Venda registrada com sucesso',
                        data: newSale
                    })
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Erro ao criar venda',
                        details: error.message
                    })
                };
            }
        }

        // ROTA: Produtos do cardápio
        if (path === 'products' && method === 'GET') {
            const mockProducts = [
                {
                    id: 1,
                    name: 'Hambúrguer Clássico',
                    description: 'Hambúrguer artesanal com carne 120g',
                    price: 25.00,
                    category: 'Lanches',
                    stock: 50,
                    active: true
                },
                {
                    id: 2,
                    name: 'Pizza Margherita',
                    description: 'Pizza tradicional com molho de tomate e manjericão',
                    price: 45.00,
                    category: 'Pizzas',
                    stock: 20,
                    active: true
                }
            ];

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    data: mockProducts,
                    total: mockProducts.length
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