/**
 * Script simples para gerar hashes das senhas dos usuários de teste
 * Execute: node scripts/generate-password-hashes.js
 */

const bcrypt = require('bcryptjs');

// Senhas dos usuários de teste
const passwords = {
    'admin': 'MariaFlor2025!',
    'gerente': 'Gerente123!',
    'garcom1': 'Garcom123!',
    'garcom2': 'Garcom123!',
    'cozinha1': 'Cozinha123!',
    'cozinha2': 'Cozinha123!',
    'caixa1': 'Caixa123!',
    'caixa2': 'Caixa123!',
    'estoque1': 'Estoque123!',
    'estoque2': 'Estoque123!'
};

async function generateHashes() {
    console.log('🔐 Gerando hashes das senhas...\n');
    
    for (const [username, password] of Object.entries(passwords)) {
        const hash = await bcrypt.hash(password, 12);
        console.log(`${username}: ${hash}`);
    }
    
    console.log('\n✅ Hashes gerados com sucesso!');
    console.log('\n📝 Use estes hashes no SQL INSERT ou no sistema de autenticação');
}

generateHashes().catch(console.error);