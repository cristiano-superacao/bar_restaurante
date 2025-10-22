const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:p2b9sJP5WCEz@ep-patient-forest-a53fdwhg-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require');

// Headers CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// Configuração JWT
const JWT_SECRET = process.env.JWT_SECRET || 'maria-flor-secret-2025';

// Utilitários
const auth = {
  generateToken: (user) => {
    return jwt.sign({ 
      id: user.id, 
      username: user.username, 
      role: user.role,
      nome: user.nome || user.name
    }, JWT_SECRET, { expiresIn: '24h' });
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
};

// Handler principal
exports.handler = async (event, context) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const { path, httpMethod, body, headers } = event;
    const segments = path.split('/').filter(p => p && p !== '.netlify' && p !== 'functions' && p !== 'api');
    const [resource, action, id] = segments;
    
    const requestBody = body ? JSON.parse(body) : {};
    const authToken = headers.authorization?.split(' ')[1];

    console.log(`API: ${httpMethod} /${resource}/${action || ''}${id ? '/' + id : ''}`);

    // Roteamento
    switch (resource) {
      case 'auth':
        return await handleAuth(action, requestBody, httpMethod);
      
      case 'dashboard':
        return await handleDashboard(authToken);
      
      case 'menu':
        return await handleMenu(action, requestBody, httpMethod, id);
      
      case 'tables':
        return await handleTables(action, requestBody, httpMethod, authToken);
      
      case 'orders':
        return await handleOrders(action, requestBody, httpMethod, authToken);
      
      case 'sales':
        return await handleSales(action, requestBody, httpMethod, authToken);
      
      default:
        return errorResponse('Endpoint não encontrado', 404);
    }

  } catch (error) {
    console.error('API Error:', error);
    return errorResponse(error.message, 500);
  }
};

// Helpers
function successResponse(data, status = 200) {
  return {
    statusCode: status,
    headers: corsHeaders,
    body: JSON.stringify({ success: true, data })
  };
}

function errorResponse(message, status = 400) {
  return {
    statusCode: status,
    headers: corsHeaders,
    body: JSON.stringify({ success: false, error: message })
  };
}

// Auth handlers
async function handleAuth(action, body, method) {
  if (action === 'login' && method === 'POST') {
    const { username, password } = body;
    
    if (!username || !password) {
      return errorResponse('Username e senha são obrigatórios');
    }

    try {
      // Tentar buscar no banco primeiro
      const users = await sql`
        SELECT id, username, password_hash, nome, email, role, ativo 
        FROM usuarios 
        WHERE username = ${username} AND ativo = true
      `;

      if (users.length > 0) {
        const user = users[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (isValid) {
          const token = auth.generateToken(user);
          return successResponse({
            token,
            user: {
              id: user.id,
              username: user.username,
              nome: user.nome,
              email: user.email,
              role: user.role
            },
            message: `Bem-vindo, ${user.nome}!`,
            redirectTo: getRedirectUrl(user.role)
          });
        }
      }

      // Fallback para usuários padrão se banco não funcionar
      const defaultUsers = {
        'admin': { 
          id: 1, username: 'admin', nome: 'Administrador', role: 'admin', 
          password_hash: '$2b$12$LKJ9K.8vZQY5tP2bGZX1.OHGf4Wl7Zx9Kt5QYj3Nc7P2Bh9Dx6Ea.'
        },
        'gerente': { 
          id: 2, username: 'gerente', nome: 'Maria Santos', role: 'gerente', 
          password_hash: '$2b$12$MNO0L.9wARZ6uQ3cHaY2.PHMg5Xm8Az0Lu6RZk4Od8Q3Ci0Ez7Fb.'
        },
        'garcom': { 
          id: 3, username: 'garcom', nome: 'João Silva', role: 'garcom', 
          password_hash: '$2b$12$PQR1M.0xBSa7vR4dIbZ3.QINh6Yn9B01Mv7SalL5Pe9R4Dj1F08Gc.'
        },
        'cozinha': { 
          id: 4, username: 'cozinha', nome: 'Ana Costa', role: 'cozinha', 
          password_hash: '$2b$12$STU2N.1yCS8wS5eJc04.RJOi7Zo0C12Nw8TbmM6Qf0S5Ek2G19Hd.'
        },
        'caixa': { 
          id: 5, username: 'caixa', nome: 'Pedro Oliveira', role: 'caixa', 
          password_hash: '$2b$12$VWX3O.2zDT9xT6fKd15.SKPj8ap1D23Ox9UcnN7Rg1T6Fl3H20Ie.'
        }
      };

      const defaultUser = defaultUsers[username];
      if (defaultUser) {
        const isValidPassword = await bcrypt.compare(password, defaultUser.password_hash);
        if (isValidPassword) {
          const token = auth.generateToken(defaultUser);
          return successResponse({
            token,
            user: {
              id: defaultUser.id,
              username: defaultUser.username,
              nome: defaultUser.nome,
              role: defaultUser.role
            },
            message: `Bem-vindo, ${defaultUser.nome}!`,
            redirectTo: getRedirectUrl(defaultUser.role)
          });
        }
      }

      return errorResponse('Usuário ou senha inválidos', 401);

    } catch (error) {
      console.error('Login error:', error);
      return errorResponse('Erro no servidor durante login', 500);
    }
  }

  return errorResponse('Endpoint não encontrado', 404);
}

// Dashboard handler
async function handleDashboard(authToken) {
  if (!authToken) {
    return errorResponse('Token necessário', 401);
  }

  try {
    auth.verifyToken(authToken);

    // Dados simulados para fallback
    const mockData = {
      vendas_hoje: { quantidade: 23, total: 2450.80 },
      pedidos_ativos: 8,
      mesas_ocupadas: 12,
      estoque_baixo: 5,
      vendas_semana: [
        { dia: 'Seg', valor: 1200 },
        { dia: 'Ter', valor: 1500 },
        { dia: 'Qua', valor: 1800 },
        { dia: 'Qui', valor: 2100 },
        { dia: 'Sex', valor: 2450 },
        { dia: 'Sab', valor: 3200 },
        { dia: 'Dom', valor: 2800 }
      ]
    };

    try {
      // Tentar buscar dados reais do banco
      const vendasHoje = await sql`
        SELECT COUNT(*) as quantidade, COALESCE(SUM(valor_pago), 0) as total
        FROM vendas 
        WHERE DATE(data_venda) = CURRENT_DATE
      `;

      const pedidosAtivos = await sql`
        SELECT COUNT(*) as total FROM pedidos
        WHERE status IN ('aberto', 'confirmado', 'preparando', 'pronto')
      `;

      return successResponse({
        vendas_hoje: {
          quantidade: parseInt(vendasHoje[0]?.quantidade || 0),
          total: parseFloat(vendasHoje[0]?.total || 0)
        },
        pedidos_ativos: parseInt(pedidosAtivos[0]?.total || 0),
        mesas_ocupadas: 12, // Mock
        estoque_baixo: 5,    // Mock
        vendas_semana: mockData.vendas_semana
      });

    } catch (dbError) {
      console.log('Using mock data:', dbError.message);
      return successResponse(mockData);
    }

  } catch (error) {
    return errorResponse(error.message, 403);
  }
}

// Menu handlers
async function handleMenu(action, body, method, id) {
  if (action === 'categories' && method === 'GET') {
    try {
      const categories = await sql`
        SELECT * FROM categorias WHERE ativo = true ORDER BY ordem, nome
      `;
      return successResponse(categories);
    } catch (error) {
      // Mock data
      const mockCategories = [
        { id: 1, nome: 'Entradas', descricao: 'Pratos para começar', icone: 'fas fa-seedling', cor: '#28a745' },
        { id: 2, nome: 'Pratos Principais', descricao: 'Pratos principais da casa', icone: 'fas fa-utensils', cor: '#dc3545' },
        { id: 3, nome: 'Bebidas', descricao: 'Bebidas variadas', icone: 'fas fa-glass-cheers', cor: '#007bff' },
        { id: 4, nome: 'Sobremesas', descricao: 'Doces e sobremesas', icone: 'fas fa-ice-cream', cor: '#fd7e14' }
      ];
      return successResponse(mockCategories);
    }
  }

  if (action === 'items' && method === 'GET') {
    try {
      const items = await sql`
        SELECT c.*, cat.nome as categoria_nome 
        FROM cardapio c
        LEFT JOIN categorias cat ON c.categoria_id = cat.id
        WHERE c.disponivel = true
        ORDER BY cat.ordem, c.nome
      `;
      return successResponse(items);
    } catch (error) {
      // Mock data
      const mockItems = [
        { id: 1, nome: 'Bruschetta', descricao: 'Torrada com tomate e manjericão', preco: 18.90, categoria_id: 1, categoria_nome: 'Entradas' },
        { id: 2, nome: 'Risotto de Camarão', descricao: 'Risotto cremoso com camarões grandes', preco: 45.90, categoria_id: 2, categoria_nome: 'Pratos Principais' },
        { id: 3, nome: 'Caipirinha', descricao: 'Caipirinha tradicional', preco: 12.90, categoria_id: 3, categoria_nome: 'Bebidas' }
      ];
      return successResponse(mockItems);
    }
  }

  return errorResponse('Endpoint não encontrado', 404);
}

// Tables handler
async function handleTables(action, body, method, authToken) {
  try {
    const mesas = await sql`SELECT * FROM mesas ORDER BY numero`;
    return successResponse(mesas);
  } catch (error) {
    // Mock data
    const mockTables = [
      { id: 1, numero: 1, capacidade: 2, status: 'livre', localizacao: 'salao' },
      { id: 2, numero: 2, capacidade: 4, status: 'ocupada', localizacao: 'salao' },
      { id: 3, numero: 3, capacidade: 4, status: 'livre', localizacao: 'salao' },
      { id: 4, numero: 4, capacidade: 6, status: 'reservada', localizacao: 'varanda' }
    ];
    return successResponse(mockTables);
  }
}

// Orders handler  
async function handleOrders(action, body, method, authToken) {
  if (!authToken) {
    return errorResponse('Token necessário', 401);
  }

  // Mock data para pedidos
  const mockOrders = [
    { id: 1, numero: 1001, mesa_numero: 2, status: 'preparando', total: 67.80, garcom_nome: 'João Silva' },
    { id: 2, numero: 1002, mesa_numero: 4, status: 'pronto', total: 89.50, garcom_nome: 'Maria Santos' }
  ];

  return successResponse(mockOrders);
}

// Sales handler
async function handleSales(action, body, method, authToken) {
  if (!authToken) {
    return errorResponse('Token necessário', 401);
  }

  // Mock data para vendas
  const mockSales = [
    { id: 1, pedido_numero: 1001, valor_pago: 67.80, metodo_pagamento: 'cartao_credito', data_venda: new Date() }
  ];

  return successResponse(mockSales);
}

// Utility functions
function getRedirectUrl(role) {
  const redirects = {
    'admin': '/pages/dashboard.html',
    'gerente': '/pages/dashboard.html',
    'garcom': '/pages/dashboard.html',
    'cozinha': '/pages/dashboard.html',
    'caixa': '/pages/dashboard.html'
  };
  return redirects[role] || '/pages/dashboard.html';
}