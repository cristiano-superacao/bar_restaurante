#!/usr/bin/env node

/**
 * Script de Teste de Integração do Sistema
 * Verifica todas as conexões e integrações do sistema Maria Flor
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
    console.log('\n' + '='.repeat(60));
    log(title, 'cyan');
    console.log('='.repeat(60));
}

// Resultados dos testes
const testResults = {
    passed: 0,
    failed: 0,
    warnings: 0,
    tests: []
};

function addTest(name, status, details = '') {
    testResults.tests.push({ name, status, details });
    if (status === 'PASS') testResults.passed++;
    else if (status === 'FAIL') testResults.failed++;
    else if (status === 'WARN') testResults.warnings++;
    
    const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
    log(`  [${status}] ${name}${details ? ': ' + details : ''}`, color);
}

// Teste 1: Verificar estrutura de arquivos
section('1. VERIFICAÇÃO DA ESTRUTURA DE ARQUIVOS');

function checkFile(filePath, description) {
    const fullPath = path.join(__dirname, filePath);
    if (fs.existsSync(fullPath)) {
        addTest(description, 'PASS', filePath);
        return true;
    } else {
        addTest(description, 'FAIL', `Arquivo não encontrado: ${filePath}`);
        return false;
    }
}

// Arquivos principais
checkFile('package.json', 'Package.json');
checkFile('server.js', 'Servidor Express');
checkFile('index.html', 'Página de login');
checkFile('.env.example', 'Exemplo de variáveis de ambiente');

// API Files
checkFile('api/routes.js', 'Rotas da API');
checkFile('api/auth.js', 'Módulo de autenticação');
checkFile('api/sales.js', 'Módulo de vendas');
checkFile('api/products.js', 'Módulo de produtos');
checkFile('api/orders.js', 'Módulo de pedidos');
checkFile('api/reports.js', 'Módulo de relatórios');

// Netlify Functions
checkFile('netlify/functions/server.js', 'Netlify Function principal');

// Database Files
checkFile('database/schema.sql', 'Schema do banco de dados');

// Frontend Files
checkFile('js/auth-neon.js', 'JavaScript de autenticação');
checkFile('js/login.js', 'JavaScript de login');
checkFile('js/dashboard.js', 'JavaScript do dashboard');

// Teste 2: Verificar dependências
section('2. VERIFICAÇÃO DAS DEPENDÊNCIAS');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

function checkDependency(depName, description) {
    if (packageJson.dependencies && packageJson.dependencies[depName]) {
        addTest(description, 'PASS', `v${packageJson.dependencies[depName]}`);
        
        // Verificar se está instalado
        const modulePath = path.join(__dirname, 'node_modules', depName);
        if (fs.existsSync(modulePath)) {
            return true;
        } else {
            addTest(`${description} (instalado)`, 'WARN', 'Dependência não instalada');
            return false;
        }
    } else {
        addTest(description, 'FAIL', 'Dependência não declarada');
        return false;
    }
}

checkDependency('@neondatabase/serverless', 'Neon Database Client');
checkDependency('@netlify/functions', 'Netlify Functions');
checkDependency('express', 'Express.js');
checkDependency('bcryptjs', 'BCrypt (criptografia)');
checkDependency('jsonwebtoken', 'JWT (autenticação)');
checkDependency('cors', 'CORS');
checkDependency('dotenv', 'DotEnv');

// Teste 3: Verificar estrutura das APIs
section('3. VERIFICAÇÃO DA ESTRUTURA DAS APIs');

function analyzeApiFile(filePath, moduleName) {
    try {
        const content = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
        
        // Verificar importação do Neon
        if (content.includes('@neondatabase/serverless') || content.includes('neon')) {
            addTest(`${moduleName} - Importação Neon`, 'PASS');
        } else {
            addTest(`${moduleName} - Importação Neon`, 'WARN', 'Neon não importado');
        }
        
        // Verificar configuração de DATABASE_URL
        if (content.includes('DATABASE_URL') || content.includes('process.env')) {
            addTest(`${moduleName} - Configuração env`, 'PASS');
        } else {
            addTest(`${moduleName} - Configuração env`, 'FAIL', 'DATABASE_URL não encontrada');
        }
        
        // Verificar uso do Express Router
        if (content.includes('express.Router') || content.includes('router')) {
            addTest(`${moduleName} - Express Router`, 'PASS');
        } else {
            addTest(`${moduleName} - Express Router`, 'WARN', 'Router não encontrado');
        }
        
        // Verificar rotas GET/POST
        const hasRoutes = content.includes('router.get') || content.includes('router.post');
        if (hasRoutes) {
            addTest(`${moduleName} - Rotas definidas`, 'PASS');
        } else {
            addTest(`${moduleName} - Rotas definidas`, 'FAIL', 'Nenhuma rota encontrada');
        }
        
        return true;
    } catch (error) {
        addTest(`${moduleName} - Análise`, 'FAIL', error.message);
        return false;
    }
}

analyzeApiFile('api/auth.js', 'Auth API');
analyzeApiFile('api/sales.js', 'Sales API');
analyzeApiFile('api/products.js', 'Products API');
analyzeApiFile('api/orders.js', 'Orders API');

// Teste 4: Verificar Netlify Function
section('4. VERIFICAÇÃO DA NETLIFY FUNCTION');

try {
    const netlifyFunction = fs.readFileSync(
        path.join(__dirname, 'netlify/functions/server.js'), 
        'utf8'
    );
    
    if (netlifyFunction.includes('exports.handler')) {
        addTest('Handler Netlify', 'PASS');
    } else {
        addTest('Handler Netlify', 'FAIL', 'exports.handler não encontrado');
    }
    
    if (netlifyFunction.includes('@neondatabase/serverless')) {
        addTest('Neon importado na function', 'PASS');
    } else {
        addTest('Neon importado na function', 'WARN', 'Neon não importado');
    }
    
    if (netlifyFunction.includes('DATABASE_URL')) {
        addTest('DATABASE_URL configurada', 'PASS');
    } else {
        addTest('DATABASE_URL configurada', 'FAIL');
    }
    
    // Verificar rotas implementadas
    const routes = [
        { path: '/auth/login', name: 'Login' },
        { path: '/dashboard', name: 'Dashboard' },
        { path: '/test', name: 'Health check' },
        { path: '/users', name: 'Usuários' }
    ];
    
    routes.forEach(route => {
        if (netlifyFunction.includes(route.path)) {
            addTest(`Rota ${route.name}`, 'PASS', route.path);
        } else {
            addTest(`Rota ${route.name}`, 'WARN', `${route.path} não encontrada`);
        }
    });
    
} catch (error) {
    addTest('Análise Netlify Function', 'FAIL', error.message);
}

// Teste 5: Verificar Schema do Banco de Dados
section('5. VERIFICAÇÃO DO SCHEMA DO BANCO DE DADOS');

try {
    const schema = fs.readFileSync(
        path.join(__dirname, 'database/schema.sql'), 
        'utf8'
    );
    
    // Verificar tabelas principais
    const tables = [
        'users',
        'categories',
        'products',
        'customers',
        'sales',
        'sale_items',
        'orders',
        'order_items',
        'stock_movements',
        'suppliers',
        'purchases',
        'expenses'
    ];
    
    tables.forEach(table => {
        if (schema.includes(`CREATE TABLE`) && schema.includes(table)) {
            addTest(`Tabela ${table}`, 'PASS');
        } else {
            addTest(`Tabela ${table}`, 'WARN', 'Não encontrada no schema');
        }
    });
    
    // Verificar índices
    if (schema.includes('CREATE INDEX')) {
        addTest('Índices de performance', 'PASS');
    } else {
        addTest('Índices de performance', 'WARN', 'Nenhum índice definido');
    }
    
} catch (error) {
    addTest('Análise do Schema', 'FAIL', error.message);
}

// Teste 6: Verificar Frontend
section('6. VERIFICAÇÃO DO FRONTEND');

try {
    const authNeonJs = fs.readFileSync(
        path.join(__dirname, 'js/auth-neon.js'), 
        'utf8'
    );
    
    if (authNeonJs.includes('class AuthSystemNeon')) {
        addTest('Classe AuthSystemNeon', 'PASS');
    } else {
        addTest('Classe AuthSystemNeon', 'FAIL');
    }
    
    if (authNeonJs.includes('/.netlify/functions/server')) {
        addTest('URL da API configurada', 'PASS', '/.netlify/functions/server');
    } else {
        addTest('URL da API configurada', 'WARN', 'URL não encontrada');
    }
    
    if (authNeonJs.includes('fetch(')) {
        addTest('Fetch API utilizada', 'PASS');
    } else {
        addTest('Fetch API utilizada', 'FAIL');
    }
    
    if (authNeonJs.includes('localStorage')) {
        addTest('LocalStorage para sessão', 'PASS');
    } else {
        addTest('LocalStorage para sessão', 'WARN');
    }
    
} catch (error) {
    addTest('Análise Frontend', 'FAIL', error.message);
}

// Teste 7: Verificar variáveis de ambiente
section('7. VERIFICAÇÃO DAS VARIÁVEIS DE AMBIENTE');

try {
    const envExample = fs.readFileSync(
        path.join(__dirname, '.env.example'), 
        'utf8'
    );
    
    const requiredVars = [
        'DATABASE_URL',
        'JWT_SECRET',
        'NODE_ENV'
    ];
    
    requiredVars.forEach(varName => {
        if (envExample.includes(varName)) {
            addTest(`Variável ${varName}`, 'PASS', 'Documentada no .env.example');
        } else {
            addTest(`Variável ${varName}`, 'WARN', 'Não documentada');
        }
    });
    
    // Verificar se existe arquivo .env real
    if (fs.existsSync(path.join(__dirname, '.env'))) {
        addTest('Arquivo .env', 'PASS', 'Arquivo existe');
    } else {
        addTest('Arquivo .env', 'WARN', 'Arquivo não existe (usar .env.example)');
    }
    
} catch (error) {
    addTest('Análise .env', 'FAIL', error.message);
}

// Teste 8: Verificar integridade das rotas
section('8. VERIFICAÇÃO DA INTEGRIDADE DAS ROTAS');

try {
    const routesJs = fs.readFileSync(
        path.join(__dirname, 'api/routes.js'), 
        'utf8'
    );
    
    // Verificar módulos importados
    const modules = ['auth', 'sales', 'products', 'orders', 'reports'];
    modules.forEach(module => {
        if (routesJs.includes(`require('./${module}')`)) {
            addTest(`Módulo ${module} importado`, 'PASS');
        } else {
            addTest(`Módulo ${module} importado`, 'FAIL', 'Import não encontrado');
        }
    });
    
    // Verificar rotas registradas
    modules.forEach(module => {
        if (routesJs.includes(`router.use('/${module}'`)) {
            addTest(`Rota /${module} registrada`, 'PASS');
        } else if (routesJs.includes(`router.use('/api/${module}'`)) {
            addTest(`Rota /api/${module} registrada`, 'PASS');
        } else {
            addTest(`Rota /${module} registrada`, 'WARN', 'Rota não encontrada');
        }
    });
    
} catch (error) {
    addTest('Análise de rotas', 'FAIL', error.message);
}

// Resumo final
section('RESUMO DOS TESTES');

const total = testResults.passed + testResults.failed + testResults.warnings;
const passPercentage = ((testResults.passed / total) * 100).toFixed(1);

log(`Total de testes: ${total}`, 'blue');
log(`✓ Passou: ${testResults.passed}`, 'green');
log(`✗ Falhou: ${testResults.failed}`, 'red');
log(`⚠ Avisos: ${testResults.warnings}`, 'yellow');
log(`\nTaxa de sucesso: ${passPercentage}%`, 'cyan');

// Status geral
console.log('\n' + '='.repeat(60));
if (testResults.failed === 0) {
    log('✅ SISTEMA ÍNTEGRO - Todas as verificações críticas passaram!', 'green');
    log('O sistema está pronto para uso.', 'green');
} else if (testResults.failed < 5) {
    log('⚠️  SISTEMA FUNCIONAL - Algumas correções necessárias', 'yellow');
    log('O sistema pode funcionar, mas requer atenção.', 'yellow');
} else {
    log('❌ SISTEMA COM PROBLEMAS - Correções críticas necessárias', 'red');
    log('Revise os erros acima antes de usar o sistema.', 'red');
}
console.log('='.repeat(60) + '\n');

// Recomendações
section('RECOMENDAÇÕES');

const recommendations = [];

if (testResults.tests.some(t => t.details && t.details.includes('Dependência não instalada'))) {
    recommendations.push('Execute "npm install" para instalar as dependências');
}

if (!fs.existsSync(path.join(__dirname, '.env'))) {
    recommendations.push('Crie o arquivo .env baseado no .env.example');
    recommendations.push('Configure DATABASE_URL com suas credenciais do Neon');
}

if (testResults.tests.some(t => t.name.includes('Neon') && t.status === 'WARN')) {
    recommendations.push('Verifique a configuração do Neon Database em todos os módulos');
}

if (recommendations.length > 0) {
    recommendations.forEach((rec, index) => {
        log(`${index + 1}. ${rec}`, 'cyan');
    });
} else {
    log('Nenhuma recomendação adicional.', 'green');
}

// Exportar resultados
const reportPath = path.join(__dirname, 'test-integration-report.json');
fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
log(`\n📄 Relatório completo salvo em: ${reportPath}`, 'blue');

// Exit code
process.exit(testResults.failed > 0 ? 1 : 0);
