const https = require('https');

console.log('🔍 Verificando status do deploy...\n');

// URLs para testar
const urls = [
    'https://barestaurente.netlify.app',
    'https://bar-restaurante.netlify.app', 
    'https://barestaurante.netlify.app',
    'https://cristiano-superacao.netlify.app',
    'https://mariaflor.netlify.app'
];

function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.get(url, (res) => {
            console.log(`✅ ${url} - Status: ${res.statusCode}`);
            resolve({ url, status: res.statusCode, working: res.statusCode === 200 });
        });
        
        req.on('error', (error) => {
            console.log(`❌ ${url} - Erro: ${error.message}`);
            resolve({ url, status: 'erro', working: false });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`⏰ ${url} - Timeout`);
            resolve({ url, status: 'timeout', working: false });
        });
    });
}

async function checkAllUrls() {
    console.log('Testando URLs possíveis:\n');
    
    for (const url of urls) {
        await checkUrl(url);
    }
    
    console.log('\n📋 Recomendações:');
    console.log('1. Verifique no painel Netlify qual é a URL real do seu site');
    console.log('2. Acesse: https://app.netlify.com/teams/cristiano-superacao/sites');
    console.log('3. Procure pelo site "bar_restaurante" ou similar');
    console.log('4. Verifique se o deploy foi realizado com sucesso');
    console.log('5. Configure um custom domain se necessário');
}

checkAllUrls();