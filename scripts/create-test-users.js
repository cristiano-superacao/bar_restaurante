/**
 * Script para criar usuários de teste no Sistema Maria Flor
 * Execute: node scripts/create-test-users.js
 */

const bcrypt = require('bcryptjs');

// Configuração dos usuários de teste
const testUsers = [
    // 👑 Administração (Acesso Total)
    {
        username: 'admin',
        password: 'MariaFlor2025!',
        email: 'admin@mariaflor.com',
        full_name: 'Administrador do Sistema',
        role: 'admin'
    },
    {
        username: 'gerente',
        password: 'Gerente123!',
        email: 'gerente@mariaflor.com',
        full_name: 'Gerente Geral',
        role: 'gerente'
    },
    
    // 🍽️ Atendimento (Vendas e Pedidos)
    {
        username: 'garcom1',
        password: 'Garcom123!',
        email: 'garcom1@mariaflor.com',
        full_name: 'Ana Silva - Garçonete',
        role: 'garcom'
    },
    {
        username: 'garcom2',
        password: 'Garcom123!',
        email: 'garcom2@mariaflor.com',
        full_name: 'João Santos - Garçom',
        role: 'garcom'
    },
    
    // 🔥 Cozinha (Pedidos e Cardápio)
    {
        username: 'cozinha1',
        password: 'Cozinha123!',
        email: 'cozinha1@mariaflor.com',
        full_name: 'Maria José - Chef de Cozinha',
        role: 'cozinha'
    },
    {
        username: 'cozinha2',
        password: 'Cozinha123!',
        email: 'cozinha2@mariaflor.com',
        full_name: 'Pedro Oliveira - Cozinheiro',
        role: 'cozinha'
    },
    
    // 💰 Financeiro (Vendas e Caixa)
    {
        username: 'caixa1',
        password: 'Caixa123!',
        email: 'caixa1@mariaflor.com',
        full_name: 'Carla Lima - Operadora de Caixa',
        role: 'caixa'
    },
    {
        username: 'caixa2',
        password: 'Caixa123!',
        email: 'caixa2@mariaflor.com',
        full_name: 'Roberto Costa - Caixa',
        role: 'caixa'
    },
    
    // 📦 Estoque (Controle de Estoque)
    {
        username: 'estoque1',
        password: 'Estoque123!',
        email: 'estoque1@mariaflor.com',
        full_name: 'Fernanda Souza - Almoxarife',
        role: 'estoque'
    },
    {
        username: 'estoque2',
        password: 'Estoque123!',
        email: 'estoque2@mariaflor.com',
        full_name: 'Carlos Pereira - Controle de Estoque',
        role: 'estoque'
    }
];

/**
 * Função para conectar ao banco de dados
 */
async function connectDatabase() {
    if (process.env.NODE_ENV === 'production') {
        // Em produção, usar Neon PostgreSQL
        const { Pool } = require('pg');
        return new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });
    } else {
        // Em desenvolvimento, você pode usar um banco local
        console.log('🔧 Modo desenvolvimento - configurar DATABASE_URL no .env');
        return null;
    }
}

/**
 * Função para criar hash da senha
 */
async function hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

/**
 * Função para inserir usuários no banco
 */
async function createTestUsers() {
    let client = null;
    
    try {
        console.log('🚀 Iniciando criação de usuários de teste...');
        
        // Conectar ao banco
        const pool = await connectDatabase();
        if (!pool) {
            throw new Error('Não foi possível conectar ao banco de dados');
        }
        
        client = await pool.connect();
        
        // Começar transação
        await client.query('BEGIN');
        
        // Limpar usuários de teste existentes
        console.log('🧹 Limpando usuários de teste existentes...');
        const usernames = testUsers.map(user => `'${user.username}'`).join(', ');
        await client.query(`DELETE FROM users WHERE username IN (${usernames})`);
        
        // Inserir novos usuários
        console.log('👥 Criando usuários de teste...');
        let createdCount = 0;
        
        for (const user of testUsers) {
            const hashedPassword = await hashPassword(user.password);
            
            const query = `
                INSERT INTO users (username, password_hash, email, full_name, role, active, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
                RETURNING id, username, role
            `;
            
            const values = [
                user.username,
                hashedPassword,
                user.email,
                user.full_name,
                user.role,
                true
            ];
            
            const result = await client.query(query, values);
            const createdUser = result.rows[0];
            
            console.log(`✅ Usuário criado: ${createdUser.username} (${createdUser.role}) - ID: ${createdUser.id}`);
            createdCount++;
        }
        
        // Confirmar transação
        await client.query('COMMIT');
        
        // Mostrar resumo
        console.log('\n📊 Resumo da criação:');
        console.log(`✅ ${createdCount} usuários criados com sucesso!`);
        
        // Mostrar estatísticas por role
        const statsQuery = `
            SELECT 
                role as perfil,
                COUNT(*) as quantidade,
                STRING_AGG(username, ', ') as usuarios
            FROM users 
            WHERE username IN (${usernames})
            GROUP BY role
            ORDER BY 
                CASE role 
                    WHEN 'admin' THEN 1 
                    WHEN 'gerente' THEN 2 
                    WHEN 'garcom' THEN 3 
                    WHEN 'cozinha' THEN 4 
                    WHEN 'caixa' THEN 5 
                    WHEN 'estoque' THEN 6 
                    ELSE 7 
                END
        `;
        
        const statsResult = await client.query(statsQuery);
        
        console.log('\n📈 Usuários por perfil:');
        statsResult.rows.forEach(row => {
            console.log(`${row.perfil}: ${row.quantidade} usuário(s) - ${row.usuarios}`);
        });
        
        console.log('\n🔐 Credenciais criadas:');
        testUsers.forEach(user => {
            console.log(`${user.username} / ${user.password} (${user.role})`);
        });
        
    } catch (error) {
        // Reverter transação em caso de erro
        if (client) {
            await client.query('ROLLBACK');
        }
        
        console.error('❌ Erro ao criar usuários de teste:', error.message);
        throw error;
        
    } finally {
        // Fechar conexão
        if (client) {
            client.release();
            console.log('\n🔌 Conexão com banco fechada');
        }
    }
}

/**
 * Função para testar login dos usuários criados
 */
async function testUserLogins() {
    console.log('\n🧪 Testando logins dos usuários criados...');
    
    for (const user of testUsers.slice(0, 3)) { // Testar apenas os 3 primeiros
        const isValid = await bcrypt.compare(user.password, await hashPassword(user.password));
        console.log(`${isValid ? '✅' : '❌'} ${user.username}: ${isValid ? 'OK' : 'ERRO'}`);
    }
}

/**
 * Função principal
 */
async function main() {
    try {
        // Verificar variáveis de ambiente
        if (!process.env.DATABASE_URL) {
            console.error('❌ DATABASE_URL não configurada no arquivo .env');
            console.log('💡 Configure a variável DATABASE_URL com a string de conexão do Neon PostgreSQL');
            process.exit(1);
        }
        
        // Criar usuários
        await createTestUsers();
        
        // Testar alguns logins
        await testUserLogins();
        
        console.log('\n🎉 Script executado com sucesso!');
        console.log('🌐 Os usuários estão prontos para usar no sistema');
        
    } catch (error) {
        console.error('\n💥 Erro durante execução:', error.message);
        process.exit(1);
    }
}

// Executar script se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    testUsers,
    createTestUsers,
    hashPassword
};