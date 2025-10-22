const bcrypt = require('bcryptjs');

/**
 * Script para gerar hashes das senhas padrão
 * Execute com: node scripts/generate-hashes.js
 */

const users = [
    { username: 'admin', password: 'admin123' },
    { username: 'gerente', password: 'gerente123' },
    { username: 'garcom', password: 'garcom123' },
    { username: 'cozinha', password: 'cozinha123' },
    { username: 'caixa', password: 'caixa123' }
];

async function generateHashes() {
    console.log('🔐 Gerando hashes das senhas...\n');
    
    for (const user of users) {
        const hash = await bcrypt.hash(user.password, 12);
        console.log(`${user.username}: '${hash}',`);
    }
    
    console.log('\n✅ Hashes gerados! Use-os no schema.sql ou na API.');
}

generateHashes().catch(console.error);