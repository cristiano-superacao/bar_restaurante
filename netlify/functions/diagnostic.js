// Função para diagnóstico completo do banco Neon
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

const diagnosticDatabase = async () => {
  try {
    console.log('🔍 Iniciando diagnóstico do banco...');
    console.log('🔗 DATABASE_URL existe:', !!DATABASE_URL);
    console.log('🔗 NETLIFY_DATABASE_URL existe:', !!process.env.NETLIFY_DATABASE_URL);
    
    if (!DATABASE_URL) {
      return {
        success: false,
        error: 'DATABASE_URL não configurada',
        env_vars: {
          NETLIFY_DATABASE_URL: !!process.env.NETLIFY_DATABASE_URL,
          DATABASE_URL: !!process.env.DATABASE_URL
        }
      };
    }

    const sql = neon(DATABASE_URL);
    
    // Testar conexão básica
    console.log('🔄 Testando conexão...');
    const connectionTest = await sql`SELECT NOW() as current_time, version() as db_version`;
    console.log('✅ Conexão OK:', connectionTest[0]);

    // Verificar se tabela usuarios existe
    console.log('🔄 Verificando tabela usuarios...');
    const tableExists = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      ) as exists
    `;
    console.log('📋 Tabela usuarios existe:', tableExists[0].exists);

    if (!tableExists[0].exists) {
      console.log('⚠️ Criando tabela usuarios...');
      await sql`
        CREATE TABLE usuarios (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          senha_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'usuario',
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ultimo_login TIMESTAMP
        )
      `;
      console.log('✅ Tabela usuarios criada');
    }

    // Verificar usuários existentes
    console.log('🔄 Consultando usuários...');
    const usuarios = await sql`SELECT id, nome, email, senha_hash, role, ativo FROM usuarios ORDER BY id`;
    console.log('👥 Usuários encontrados:', usuarios.length);
    
    for (const user of usuarios) {
      console.log(`👤 ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Ativo: ${user.ativo}`);
    }

    // Se não houver usuários, criar os padrão
    if (usuarios.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado, criando usuários padrão...');
      const newUsers = await sql`
        INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES
        ('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador', true),
        ('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente', true),
        ('Usuário do Sistema', 'usuario@mariaflor.com.br', 'usuario123', 'usuario', true)
        RETURNING id, nome, email, role
      `;
      console.log('✅ Usuários criados:', newUsers);
    }

    // Testar autenticação de cada usuário
    console.log('🔄 Testando autenticação...');
    const testUsers = [
      { email: 'admin@mariaflor.com.br', senha: 'admin123' },
      { email: 'gerente@mariaflor.com.br', senha: 'gerente123' },
      { email: 'usuario@mariaflor.com.br', senha: 'usuario123' }
    ];

    const authResults = [];
    for (const testUser of testUsers) {
      const userCheck = await sql`
        SELECT id, nome, email, senha_hash, role, ativo 
        FROM usuarios 
        WHERE email = ${testUser.email} AND ativo = true
      `;
      
      if (userCheck.length > 0) {
        const user = userCheck[0];
        const senhaMatch = user.senha_hash === testUser.senha;
        authResults.push({
          email: testUser.email,
          encontrado: true,
          senhaCorreta: senhaMatch,
          senhaEsperada: testUser.senha,
          senhaArmazenada: user.senha_hash,
          role: user.role
        });
        console.log(`🔍 ${testUser.email}: Encontrado=${true}, Senha=${senhaMatch}`);
      } else {
        authResults.push({
          email: testUser.email,
          encontrado: false,
          senhaCorreta: false
        });
        console.log(`❌ ${testUser.email}: Usuário não encontrado`);
      }
    }

    return {
      success: true,
      message: 'Diagnóstico completo',
      database: {
        connected: true,
        version: connectionTest[0].db_version,
        current_time: connectionTest[0].current_time
      },
      table: {
        exists: tableExists[0].exists
      },
      usuarios: usuarios,
      authTest: authResults
    };
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  const result = await diagnosticDatabase();
  
  return {
    statusCode: result.success ? 200 : 500,
    headers,
    body: JSON.stringify(result, null, 2)
  };
};