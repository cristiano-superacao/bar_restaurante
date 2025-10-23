const https = require('https');

console.log('🧪 Testando credenciais do sistema...\n');

// Lista de credenciais para testar
const credenciais = [
    { email: 'cristiano@mariaflor.com.br', senha: 'admin123' },
    { email: 'maria@mariaflor.com.br', senha: 'maria2024' },
    { email: 'joao.chef@mariaflor.com.br', senha: 'chef2024' },
    { email: 'ana.garcom@mariaflor.com.br', senha: 'garcom2024' },
    { email: 'carlos.caixa@mariaflor.com.br', senha: 'caixa2024' },
    { email: 'pedro.estoque@mariaflor.com.br', senha: 'estoque2024' },
    { email: 'juliana.garcom@mariaflor.com.br', senha: 'garcom123' },
    { email: 'roberto.ajudante@mariaflor.com.br', senha: 'ajudante123' },
    { email: 'sandra.supervisor@mariaflor.com.br', senha: 'supervisor2024' },
    { email: 'teste@mariaflor.com.br', senha: 'teste123' }
];

async function testCredential(email, senha) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ email, senha });
        
        const options = {
            hostname: 'barestaurente.netlify.app',
            port: 443,
            path: '/.netlify/functions/server/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    resolve({
                        email,
                        senha,
                        success: result.success,
                        message: result.message || 'OK',
                        user: result.user
                    });
                } catch (error) {
                    resolve({
                        email,
                        senha,
                        success: false,
                        message: 'Erro ao processar resposta',
                        error: error.message
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                email,
                senha,
                success: false,
                message: 'Erro de conexão',
                error: error.message
            });
        });

        req.write(data);
        req.end();
    });
}

async function testAllCredentials() {
    console.log('Testando credenciais no sistema...\n');
    
    const validCredentials = [];
    const invalidCredentials = [];
    
    for (const credential of credenciais) {
        const result = await testCredential(credential.email, credential.senha);
        
        if (result.success) {
            console.log(`✅ ${result.email} | ${result.senha} - FUNCIONA`);
            if (result.user) {
                console.log(`   👤 Nome: ${result.user.nome} | Role: ${result.user.role}`);
            }
            validCredentials.push(credential);
        } else {
            console.log(`❌ ${result.email} | ${result.senha} - ${result.message}`);
            invalidCredentials.push(credential);
        }
        
        // Pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Resumo dos Testes:');
    console.log(`✅ Credenciais válidas: ${validCredentials.length}`);
    console.log(`❌ Credenciais inválidas: ${invalidCredentials.length}`);
    
    if (validCredentials.length > 0) {
        console.log('\n🔑 Credenciais que funcionam:');
        validCredentials.forEach(cred => {
            console.log(`   📧 ${cred.email} | 🔑 ${cred.senha}`);
        });
    }
    
    if (invalidCredentials.length > 0) {
        console.log('\n🗑️ Credenciais para remover:');
        invalidCredentials.forEach(cred => {
            console.log(`   📧 ${cred.email} | 🔑 ${cred.senha}`);
        });
    }
}

testAllCredentials();