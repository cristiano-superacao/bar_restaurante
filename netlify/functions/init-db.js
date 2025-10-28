// Função temporária para inicializar o banco de dados
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
const sql = neon(DATABASE_URL);

const initDatabase = async () => {
  try {
    console.log('🗄️ Inicializando banco de dados Neon...');

    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
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

    // Inserir usuários padrão
    await sql`
      INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
      ('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador'),
      ('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente'),
      ('Usuário do Sistema', 'usuario@mariaflor.com.br', 'usuario123', 'usuario')
      ON CONFLICT (email) DO NOTHING
    `;

    // Criar índices
    await sql`CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo)`;

    // Criar tabela de vendas
    await sql`
      CREATE TABLE IF NOT EXISTS vendas (
          id SERIAL PRIMARY KEY,
          usuario_id INTEGER REFERENCES usuarios(id),
          total DECIMAL(10,2) NOT NULL,
          metodo_pagamento VARCHAR(50),
          status VARCHAR(20) DEFAULT 'concluida',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS produtos (
          id SERIAL PRIMARY KEY,
          nome VARCHAR(100) NOT NULL,
          preco DECIMAL(10,2) NOT NULL,
          categoria VARCHAR(50),
          estoque INTEGER DEFAULT 0,
          ativo BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Inserir produtos de exemplo
    await sql`
      INSERT INTO produtos (nome, preco, categoria, estoque) VALUES
      ('Hambúrguer Clássico', 25.00, 'lanches', 50),
      ('Pizza Margherita', 45.00, 'pizzas', 30),
      ('Batata Frita', 10.00, 'acompanhamentos', 100),
      ('Refrigerante', 5.00, 'bebidas', 200),
      ('Café Expresso', 3.50, 'bebidas', 150)
      ON CONFLICT DO NOTHING
    `;

    // Criar tabela de mesas
    await sql`
      CREATE TABLE IF NOT EXISTS mesas (
          id SERIAL PRIMARY KEY,
          numero INTEGER UNIQUE NOT NULL,
          capacidade INTEGER NOT NULL,
          status VARCHAR(20) DEFAULT 'livre',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Inserir mesas
    await sql`
      INSERT INTO mesas (numero, capacidade) VALUES
      (1, 4), (2, 4), (3, 2), (4, 6), (5, 4),
      (6, 2), (7, 4), (8, 8), (9, 4), (10, 2)
      ON CONFLICT (numero) DO NOTHING
    `;

    console.log('✅ Banco de dados inicializado com sucesso!');
    
    // Testar dados
    const usuarios = await sql`SELECT COUNT(*) as total FROM usuarios`;
    const produtos = await sql`SELECT COUNT(*) as total FROM produtos`;
    const mesas = await sql`SELECT COUNT(*) as total FROM mesas`;
    
    console.log(`📊 Dados inseridos:`);
    console.log(`👥 Usuários: ${usuarios[0].total}`);
    console.log(`🍔 Produtos: ${produtos[0].total}`);
    console.log(`🪑 Mesas: ${mesas[0].total}`);
    
    return {
      success: true,
      message: 'Banco inicializado com sucesso',
      data: {
        usuarios: usuarios[0].total,
        produtos: produtos[0].total,
        mesas: mesas[0].total
      }
    };
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return {
      success: false,
      error: error.message
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

  const result = await initDatabase();
  
  return {
    statusCode: result.success ? 200 : 500,
    headers,
    body: JSON.stringify(result)
  };
};