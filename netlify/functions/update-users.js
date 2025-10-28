// Função para atualizar usuários no banco Neon
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

const updateUsers = async () => {
  try {
    console.log('🔄 Atualizando usuários no banco Neon...');

    // Primeiro, limpar usuários existentes
    await sql`DELETE FROM usuarios`;
    console.log('✅ Usuários antigos removidos');

    // Inserir usuários atualizados com senhas corretas
    const usuarios = await sql`
      INSERT INTO usuarios (nome, email, senha_hash, role, ativo) VALUES
      ('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador', true),
      ('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente', true),
      ('Usuário do Sistema', 'usuario@mariaflor.com.br', 'usuario123', 'usuario', true)
      RETURNING id, nome, email, role, ativo
    `;

    console.log('✅ Usuários inseridos:', usuarios);

    // Verificar se foram inseridos corretamente
    const count = await sql`SELECT COUNT(*) as total FROM usuarios WHERE ativo = true`;
    console.log(`📊 Total de usuários ativos: ${count[0].total}`);

    // Listar todos os usuários para confirmar
    const allUsers = await sql`
      SELECT id, nome, email, role, ativo, created_at 
      FROM usuarios 
      ORDER BY id
    `;

    console.log('👥 Usuários no banco:', allUsers);

    return {
      success: true,
      message: 'Usuários atualizados com sucesso',
      usuarios: allUsers,
      total: count[0].total
    };
    
  } catch (error) {
    console.error('❌ Erro ao atualizar usuários:', error);
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

  const result = await updateUsers();
  
  return {
    statusCode: result.success ? 200 : 500,
    headers,
    body: JSON.stringify(result)
  };
};