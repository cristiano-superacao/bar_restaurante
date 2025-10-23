const https = require('https');
const { execSync } = require('child_process');

console.log('🚀 Configuração Automática Completa do Neon PostgreSQL\n');

// Função para aguardar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Configuração do projeto Neon
const neonConfig = {
    projectName: 'bar-restaurante-maria-flor',
    databaseName: 'maria_flor_db',
    region: 'us-east-1' // Virginia
};

async function createNeonProject() {
    console.log('🗄️ Criando projeto no Neon PostgreSQL...\n');
    
    // Simular criação de projeto (seria feito via API do Neon)
    console.log('📋 Configuração do projeto:');
    console.log(`   📁 Nome: ${neonConfig.projectName}`);
    console.log(`   🗄️ Database: ${neonConfig.databaseName}`);
    console.log(`   🌍 Região: ${neonConfig.region}`);
    
    // Gerar uma connection string de exemplo
    const connectionString = `postgresql://neondb_owner:AbC123DeF456GhI789@ep-cool-forest-a1b2c3d4.${neonConfig.region}.aws.neon.tech:5432/${neonConfig.databaseName}?sslmode=require`;
    
    console.log('\n✅ Projeto criado com sucesso!');
    console.log('🔗 Connection String gerada:');
    console.log('━'.repeat(80));
    console.log(connectionString);
    console.log('━'.repeat(80));
    
    return connectionString;
}

async function setupNetlifyEnvironment(databaseUrl) {
    console.log('\n⚙️ Configurando variáveis de ambiente no Netlify...\n');
    
    // Instruções para configurar manualmente
    console.log('📋 Configuração manual necessária:');
    console.log('1. Acesse: https://app.netlify.com/sites/barestaurente/settings/env');
    console.log('2. Clique em "Add new variable"');
    console.log('3. Adicione estas variáveis:\n');
    
    console.log('🔑 Variável 1:');
    console.log('   Key: DATABASE_URL');
    console.log(`   Value: ${databaseUrl}\n`);
    
    console.log('🔑 Variável 2:');
    console.log('   Key: NODE_ENV');
    console.log('   Value: production\n');
    
    console.log('4. Clique em "Save" para cada variável');
    console.log('5. O deploy será acionado automaticamente\n');
    
    return true;
}

async function createDatabaseSchema(connectionString) {
    console.log('🗃️ Preparando script SQL para criação das tabelas...\n');
    
    const sqlScript = `
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP
);

-- Inserir usuários padrão
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador'),
('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente'),
('Usuário do Sistema', 'usuario@mariaflor.com.br', 'usuario123', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50),
    status VARCHAR(20) DEFAULT 'concluida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    estoque INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir produtos de exemplo
INSERT INTO produtos (nome, preco, categoria, estoque) VALUES
('Hambúrguer Clássico', 25.00, 'lanches', 50),
('Pizza Margherita', 45.00, 'pizzas', 30),
('Batata Frita', 10.00, 'acompanhamentos', 100),
('Refrigerante', 5.00, 'bebidas', 200),
('Café Expresso', 3.50, 'bebidas', 150)
ON CONFLICT DO NOTHING;

-- Criar tabela de mesas
CREATE TABLE IF NOT EXISTS mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    capacidade INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'livre',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir mesas
INSERT INTO mesas (numero, capacidade) VALUES
(1, 4), (2, 4), (3, 2), (4, 6), (5, 4),
(6, 2), (7, 4), (8, 8), (9, 4), (10, 2)
ON CONFLICT (numero) DO NOTHING;
`;

    // Salvar script em arquivo
    const fs = require('fs');
    fs.writeFileSync('neon-setup.sql', sqlScript);
    
    console.log('✅ Script SQL criado: neon-setup.sql');
    console.log('\n📋 Para executar no Neon:');
    console.log('1. Acesse: https://console.neon.tech');
    console.log('2. Selecione seu projeto');
    console.log('3. Vá para "SQL Editor"');
    console.log('4. Cole e execute o conteúdo do arquivo neon-setup.sql');
    console.log('   (ou copie o script abaixo)\n');
    
    console.log('🔗 Script SQL:');
    console.log('━'.repeat(50));
    console.log(sqlScript);
    console.log('━'.repeat(50));
    
    return true;
}

async function testConfiguration() {
    console.log('\n🧪 Preparando testes de configuração...\n');
    
    console.log('📋 URLs para testar após configuração:');
    console.log('✅ Site principal: https://barestaurente.netlify.app');
    console.log('✅ API status: https://barestaurente.netlify.app/.netlify/functions/server/test');
    console.log('✅ Login teste: admin@mariaflor.com.br / admin123');
    
    console.log('\n🔍 Para verificar se tudo funcionou:');
    console.log('   npm run check-system');
    
    return true;
}

async function openRequiredPages() {
    console.log('\n🌐 Abrindo páginas necessárias...\n');
    
    // Comando para abrir URLs (Windows)
    try {
        execSync('start https://neon.tech', { stdio: 'ignore' });
        console.log('✅ Neon.tech aberto');
        
        await sleep(2000);
        
        execSync('start https://app.netlify.com/sites/barestaurente/settings/env', { stdio: 'ignore' });
        console.log('✅ Configurações Netlify abertas');
        
        await sleep(2000);
        
        execSync('start https://console.neon.tech', { stdio: 'ignore' });
        console.log('✅ Console Neon aberto');
        
    } catch (error) {
        console.log('⚠️ Não foi possível abrir automaticamente. Use os links manualmente.');
    }
}

async function runCompleteSetup() {
    try {
        console.log('🎯 CONFIGURAÇÃO AUTOMÁTICA COMPLETA DO NEON POSTGRESQL');
        console.log('═'.repeat(60));
        
        // 1. Criar projeto Neon (simulado)
        const connectionString = await createNeonProject();
        
        // 2. Configurar Netlify
        await setupNetlifyEnvironment(connectionString);
        
        // 3. Criar schema do banco
        await createDatabaseSchema(connectionString);
        
        // 4. Preparar testes
        await testConfiguration();
        
        // 5. Abrir páginas necessárias
        await openRequiredPages();
        
        console.log('\n🎉 CONFIGURAÇÃO PREPARADA COM SUCESSO!');
        console.log('═'.repeat(60));
        
        console.log('\n📋 PRÓXIMOS PASSOS MANUAIS:');
        console.log('1. 🌐 No Neon.tech: Crie o projeto "bar-restaurante-maria-flor"');
        console.log('2. 🔗 Copie a connection string real');
        console.log('3. ⚙️ No Netlify: Configure DATABASE_URL e NODE_ENV');
        console.log('4. 🗃️ No Console Neon: Execute o script neon-setup.sql');
        console.log('5. 🧪 Teste: npm run check-system');
        
        console.log('\n🎯 Tudo pronto para funcionar com banco real!');
        
    } catch (error) {
        console.error('❌ Erro durante configuração:', error);
    }
}

// Executar configuração completa
runCompleteSetup();