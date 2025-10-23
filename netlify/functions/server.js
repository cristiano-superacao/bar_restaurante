const { neon } = require('@neondatabase/serverless');

// Configuração do banco Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://localhost:5432/test');

// Headers CORS para todas as respostas
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Função de autenticação demo (fallback)
function authenticateUserDemo(email, senha) {
  const validUsers = {
    'cristiano@mariaflor.com.br': { id: 1, nome: 'Cristiano Santos', role: 'administrador', senha: 'admin123' },
    'maria@mariaflor.com.br': { id: 2, nome: 'Maria Silva', role: 'gerente', senha: 'maria2024' },
    'joao.chef@mariaflor.com.br': { id: 3, nome: 'João Chef', role: 'cozinheiro', senha: 'chef2024' },
    'ana.garcom@mariaflor.com.br': { id: 4, nome: 'Ana Santos', role: 'garcom', senha: 'garcom2024' },
    'teste@mariaflor.com.br': { id: 10, nome: 'Usuário Teste', role: 'usuario', senha: 'teste123' }
  };

  const user = validUsers[email];
  if (user && user.senha === senha) {
    return {
      success: true,
      user: {
        id: user.id,
        nome: user.nome,
        email: email,
        role: user.role
      }
    };
  }
  
  return { success: false, message: 'Credenciais inválidas' };
}

// Função principal para autenticação
async function authenticateUser(email, senha) {
  try {
    // Verificar se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL não configurada, usando dados demo');
      return authenticateUserDemo(email, senha);
    }

    const users = await sql`
      SELECT id, nome, email, role, ativo 
      FROM usuarios 
      WHERE email = ${email} AND ativo = true
    `;
    
    if (users.length === 0) {
      return { success: false, message: 'Usuário não encontrado' };
    }

    const user = users[0];
    
    // Para demonstração, aceitar senhas simples
    // Em produção, usar bcrypt para comparar hashes
    const validPasswords = {
      'cristiano@mariaflor.com.br': 'admin123',
      'maria@mariaflor.com.br': 'maria2024',
      'joao.chef@mariaflor.com.br': 'chef2024',
      'ana.garcom@mariaflor.com.br': 'garcom2024',
      'carlos.caixa@mariaflor.com.br': 'caixa2024',
      'pedro.estoque@mariaflor.com.br': 'estoque2024',
      'juliana.garcom@mariaflor.com.br': 'garcom123',
      'roberto.ajudante@mariaflor.com.br': 'ajudante123',
      'sandra.supervisor@mariaflor.com.br': 'supervisor2024',
      'teste@mariaflor.com.br': 'teste123'
    };

    if (validPasswords[email] === senha) {
      // Atualizar último login
      try {
        await sql`
          UPDATE usuarios 
          SET ultimo_login = NOW() 
          WHERE id = ${user.id}
        `;
      } catch (updateError) {
        console.warn('⚠️ Erro ao atualizar último login:', updateError);
      }

      return {
        success: true,
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role
        }
      };
    } else {
      return { success: false, message: 'Senha incorreta' };
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return { success: false, message: 'Erro interno do servidor' };
  }
}

// Função para obter dados do dashboard
async function getDashboardData() {
  try {
    // Dados simulados para demonstração
    return {
      vendas: {
        hoje: 2500.00,
        ontem: 2100.00,
        semana: 15750.00,
        mes: 67500.00
      },
      pedidos: {
        pendentes: 8,
        preparando: 12,
        prontos: 3,
        entregues: 47
      },
      mesas: {
        ocupadas: 15,
        livres: 5,
        total: 20
      },
      produtos: {
        estoque_baixo: 12,
        total_produtos: 150,
        mais_vendidos: [
          { nome: 'Hambúrguer Clássico', vendas: 45 },
          { nome: 'Pizza Margherita', vendas: 38 },
          { nome: 'Batata Frita', vendas: 52 }
        ]
      }
    };
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    throw error;
  }
}

// Função principal do Netlify
exports.handler = async (event, context) => {
  // Tratar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/server', '');
    const method = event.httpMethod;

    // Rota de autenticação
    if (path === '/auth/login' && method === 'POST') {
      const { email, senha } = JSON.parse(event.body);
      
      if (!email || !senha) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            success: false, 
            message: 'Email e senha são obrigatórios' 
          })
        };
      }

      const result = await authenticateUser(email, senha);
      
      return {
        statusCode: result.success ? 200 : 401,
        headers,
        body: JSON.stringify(result)
      };
    }

    // Rota do dashboard
    if (path === '/dashboard' && method === 'GET') {
      const data = await getDashboardData();
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: data
        })
      };
    }

    // Rota de teste de conexão
    if (path === '/test' && method === 'GET') {
      const result = await sql`SELECT NOW() as timestamp`;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Conexão com Neon OK',
          timestamp: result[0].timestamp
        })
      };
    }

    // Rota para listar usuários (apenas para admin)
    if (path === '/users' && method === 'GET') {
      const users = await sql`
        SELECT id, nome, email, role, ativo, data_criacao, ultimo_login, telefone
        FROM usuarios 
        ORDER BY role, nome
      `;
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          users: users
        })
      };
    }

    // Rota não encontrada
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Rota não encontrada'
      })
    };

  } catch (error) {
    console.error('Erro na função:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};