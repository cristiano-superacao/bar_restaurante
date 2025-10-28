const https = require('https');

console.log('🗄️ Configurador Automático Neon PostgreSQL\n');

// Função para testar a API
async function testAPI() {
    return new Promise((resolve) => {
        const options = {
            hostname: 'barestaurente.netlify.app',
            port: 443,
            path: '/.netlify/functions/server/test',
            method: 'GET',
            headers: {
                'User-Agent': 'Neon-Setup-Script/1.0'
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
                        success: true,
                        status: res.statusCode,
                        data: result
                    });
                } catch (error) {
                    console.log('🔍 Resposta recebida:', body.substring(0, 200) + '...');
                    resolve({
                        success: false,
                        status: res.statusCode,
                        error: 'Resposta não é JSON válido',
                        contentType: res.headers['content-type'],
                        body: body.substring(0, 500)
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });

        req.end();
    });
}

// Função para testar login
async function testLogin(email, senha) {
    return new Promise((resolve) => {
        const data = JSON.stringify({ email, senha });
        
        const options = {
            hostname: 'barestaurente.netlify.app',
            port: 443,
            path: '/.netlify/functions/server/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
                'User-Agent': 'Neon-Setup-Script/1.0'
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
                        success: result.success,
                        status: res.statusCode,
                        data: result
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        status: res.statusCode,
                        error: 'Erro ao processar resposta'
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                success: false,
                error: error.message
            });
        });

        req.write(data);
        req.end();
    });
}

async function checkNeonSetup() {
    console.log('🔍 Verificando configuração atual do sistema...\n');
    
    // Testar API
    console.log('1. Testando API serverless...');
    const apiResult = await testAPI();
    
    if (apiResult.success && apiResult.status === 200) {
        console.log('✅ API funcionando corretamente');
        if (apiResult.data.database === 'connected') {
            console.log('✅ Neon PostgreSQL conectado!');
        } else {
            console.log('⚠️ API funcionando em modo demo (sem Neon)');
        }
    } else {
        console.log('❌ Problema na API:', apiResult.error || 'Status ' + apiResult.status);
    }
    
    console.log();
    
    // Testar credenciais
    console.log('2. Testando sistema de autenticação...');
    const credentials = [
        { email: 'admin@mariaflor.com.br', senha: 'admin123', tipo: 'Administrador' },
        { email: 'gerente@mariaflor.com.br', senha: 'gerente123', tipo: 'Gerente' },
        { email: 'usuario@mariaflor.com.br', senha: 'usuario123', tipo: 'Usuário' }
    ];
    
    let workingCredentials = 0;
    
    for (const cred of credentials) {
        const loginResult = await testLogin(cred.email, cred.senha);
        if (loginResult.success) {
            console.log(`✅ ${cred.tipo}: ${cred.email} - Funcionando`);
            workingCredentials++;
        } else {
            console.log(`❌ ${cred.tipo}: ${cred.email} - ${loginResult.data?.message || 'Erro'}`);
        }
        // Pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Resumo da Verificação:');
    console.log(`✅ Credenciais funcionando: ${workingCredentials}/3`);
    
    if (apiResult.success && apiResult.data?.database === 'connected') {
        console.log('🎉 Neon PostgreSQL já está configurado e funcionando!');
        console.log('\n🔗 Links importantes:');
        console.log('- Site: https://barestaurente.netlify.app');
        console.log('- Painel Netlify: https://app.netlify.com/sites/barestaurente');
        console.log('- Neon Console: https://console.neon.tech');
    } else {
        console.log('\n🔧 Para configurar o Neon PostgreSQL:');
        console.log('1. Acesse: https://neon.tech');
        console.log('2. Crie um projeto: bar-restaurante-maria-flor');
        console.log('3. Configure DATABASE_URL no Netlify');
        console.log('4. Execute as queries SQL para criar as tabelas');
        console.log('\n📋 Consulte o arquivo CONFIGURAR_NEON.md para instruções detalhadas');
    }
    
    console.log('\n🧪 Testar manualmente:');
    console.log('- Login: https://barestaurente.netlify.app');
    console.log('- API: https://barestaurente.netlify.app/.netlify/functions/server/test');
}

// Executar verificação
checkNeonSetup().catch(error => {
    console.error('\n❌ Erro durante verificação:', error);
});