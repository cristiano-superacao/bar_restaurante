#!/usr/bin/env node

/**
 * Script de Configuração Automática do Banco de Dados Neon
 * Bar Restaurante Maria Flor
 */

const { neon } = require('@neondatabase/serverless');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🎯 CONFIGURAÇÃO AUTOMÁTICA - BANCO DE DADOS NEON         ║');
  console.log('║   Bar Restaurante Maria Flor                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Passo 1: Solicitar Connection String
    console.log('📋 Passo 1: Obter Connection String do Neon\n');
    console.log('   1. Acesse: https://console.neon.tech/');
    console.log('   2. Faça login ou crie uma conta gratuita');
    console.log('   3. Crie um novo projeto ou selecione existente');
    console.log('   4. Vá em "Connection Details" → "Connection String"');
    console.log('   5. Copie a string completa\n');
    
    const connectionString = await question('🔗 Cole aqui a Connection String do Neon:\n');
    
    if (!connectionString || !connectionString.includes('postgresql://')) {
      throw new Error('Connection String inválida! Deve começar com postgresql://');
    }

    console.log('\n✅ Connection String recebida!\n');

    // Passo 2: Testar Conexão
    console.log('📡 Passo 2: Testando conexão com o banco...\n');
    
    const sql = neon(connectionString);
    const testResult = await sql`SELECT NOW() as timestamp, version() as version`;
    
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`   Timestamp: ${testResult[0].timestamp}`);
    console.log(`   PostgreSQL: ${testResult[0].version.split(' ')[0]} ${testResult[0].version.split(' ')[1]}\n`);

    // Passo 3: Criar Estrutura do Banco
    console.log('🏗️  Passo 3: Criando estrutura do banco de dados...\n');

    // Criar tabela de usuários
    console.log('   📊 Criando tabela: usuarios');
    await sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'usuario',
        ativo BOOLEAN DEFAULT true,
        telefone VARCHAR(20),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ultimo_login TIMESTAMP
      )
    `;
    console.log('   ✅ Tabela usuarios criada');

    // Criar tabela de vendas
    console.log('   📊 Criando tabela: sales');
    await sql`
      CREATE TABLE IF NOT EXISTS sales (
        id VARCHAR(50) PRIMARY KEY,
        customer_name VARCHAR(255),
        total_amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('   ✅ Tabela sales criada');

    // Criar tabela de itens da venda
    console.log('   📊 Criando tabela: sale_items');
    await sql`
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id VARCHAR(50) REFERENCES sales(id) ON DELETE CASCADE,
        product_name VARCHAR(255) NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL
      )
    `;
    console.log('   ✅ Tabela sale_items criada');

    // Criar tabela de produtos
    console.log('   📊 Criando tabela: products');
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        stock INTEGER DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('   ✅ Tabela products criada');

    // Criar tabela de mesas
    console.log('   📊 Criando tabela: tables');
    await sql`
      CREATE TABLE IF NOT EXISTS tables (
        id SERIAL PRIMARY KEY,
        number INTEGER UNIQUE NOT NULL,
        capacity INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'available',
        current_order_id VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('   ✅ Tabela tables criada\n');

    // Passo 4: Inserir Dados Iniciais
    console.log('📝 Passo 4: Inserindo dados iniciais...\n');

    // Verificar se já existem usuários
    const existingUsers = await sql`SELECT COUNT(*) as count FROM usuarios`;
    
    if (existingUsers[0].count === '0') {
      console.log('   👤 Inserindo usuários padrão');
      await sql`
        INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
        ('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador'),
        ('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente'),
        ('Garçom João Silva', 'garcom@mariaflor.com.br', 'garcom123', 'garcom'),
        ('Cozinha Master', 'cozinha@mariaflor.com.br', 'cozinha123', 'cozinha'),
        ('Caixa Principal', 'caixa@mariaflor.com.br', 'caixa123', 'caixa')
      `;
      console.log('   ✅ 5 usuários criados');
    } else {
      console.log('   ℹ️  Usuários já existem no banco');
    }

    // Verificar se já existem produtos
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    
    if (existingProducts[0].count === '0') {
      console.log('   🍔 Inserindo produtos padrão');
      await sql`
        INSERT INTO products (name, description, price, category, stock) VALUES
        ('Hambúrguer Clássico', 'Hambúrguer artesanal 120g com queijo', 25.00, 'Lanches', 50),
        ('Pizza Margherita', 'Pizza com molho de tomate e manjericão', 45.00, 'Pizzas', 20),
        ('Batata Frita', 'Porção de batatas fritas crocantes', 10.00, 'Acompanhamentos', 100),
        ('Refrigerante Lata', 'Refrigerante 350ml', 5.00, 'Bebidas', 200),
        ('Suco Natural', 'Suco natural 300ml', 8.00, 'Bebidas', 50)
      `;
      console.log('   ✅ 5 produtos criados');
    } else {
      console.log('   ℹ️  Produtos já existem no banco');
    }

    // Verificar se já existem mesas
    const existingTables = await sql`SELECT COUNT(*) as count FROM tables`;
    
    if (existingTables[0].count === '0') {
      console.log('   🪑 Inserindo mesas padrão');
      const tables = [];
      for (let i = 1; i <= 20; i++) {
        tables.push(`(${i}, ${i <= 10 ? 4 : 6}, 'available')`);
      }
      await sql.unsafe(`
        INSERT INTO tables (number, capacity, status) VALUES
        ${tables.join(', ')}
      `);
      console.log('   ✅ 20 mesas criadas');
    } else {
      console.log('   ℹ️  Mesas já existem no banco');
    }

    console.log('\n');

    // Passo 5: Criar arquivo .env
    console.log('📄 Passo 5: Criando arquivo de configuração (.env)...\n');
    
    const fs = require('fs');
    const envContent = `# Configuração do Banco de Dados Neon PostgreSQL
# Gerado automaticamente em ${new Date().toISOString()}

DATABASE_URL="${connectionString}"
NETLIFY_DATABASE_URL="${connectionString}"
JWT_SECRET="maria-flor-secret-key-${Date.now()}"
NODE_ENV="development"

# Credenciais de Teste
# Admin: admin@mariaflor.com.br / admin123
# Gerente: gerente@mariaflor.com.br / gerente123
# Garçom: garcom@mariaflor.com.br / garcom123
# Cozinha: cozinha@mariaflor.com.br / cozinha123
# Caixa: caixa@mariaflor.com.br / caixa123
`;

    fs.writeFileSync('.env', envContent, 'utf8');
    console.log('   ✅ Arquivo .env criado\n');

    // Passo 6: Verificação Final
    console.log('🔍 Passo 6: Verificação final...\n');
    
    const userCount = await sql`SELECT COUNT(*) as count FROM usuarios`;
    const productCount = await sql`SELECT COUNT(*) as count FROM products`;
    const tableCount = await sql`SELECT COUNT(*) as count FROM tables`;
    
    console.log('   📊 Estatísticas do banco:');
    console.log(`      - Usuários: ${userCount[0].count}`);
    console.log(`      - Produtos: ${productCount[0].count}`);
    console.log(`      - Mesas: ${tableCount[0].count}\n`);

    // Resumo Final
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   ✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📋 Próximos passos:\n');
    console.log('   1. ✅ Banco de dados configurado e pronto');
    console.log('   2. ✅ Tabelas criadas');
    console.log('   3. ✅ Dados iniciais inseridos');
    console.log('   4. ✅ Arquivo .env criado\n');
    
    console.log('🚀 Para usar no Netlify:\n');
    console.log('   1. Acesse: https://app.netlify.com/');
    console.log('   2. Selecione seu site');
    console.log('   3. Site Settings → Environment Variables');
    console.log('   4. Adicione as variáveis do arquivo .env');
    console.log('   5. Faça um novo deploy\n');
    
    console.log('🔗 Connection String salva em: .env\n');
    console.log('⚠️  IMPORTANTE: Não compartilhe o arquivo .env!\n');

  } catch (error) {
    console.error('\n❌ Erro durante a configuração:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('password authentication failed')) {
      console.error('💡 Dica: Verifique se a senha na Connection String está correta');
    } else if (error.message.includes('could not translate host name')) {
      console.error('💡 Dica: Verifique se a Connection String está completa');
    } else if (error.message.includes('timeout')) {
      console.error('💡 Dica: Verifique sua conexão com a internet');
    }
    
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar setup
console.log('\n🎯 Iniciando configuração do banco de dados...\n');
setupDatabase().then(() => {
  console.log('✨ Configuração finalizada!\n');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error.message);
  process.exit(1);
});
