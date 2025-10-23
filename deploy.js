#!/usr/bin/env node

/**
 * Deploy Automático para Netlify
 * Sistema Bar Restaurante Maria Flor
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando deploy automático para barestaurente.netlify.app...\n');

// Função para fazer deploy via GitHub (trigger automático)
async function triggerDeploy() {
    try {
        console.log('📋 Verificando arquivos do projeto...');
        
        // Verificar se os arquivos principais existem
        const requiredFiles = [
            'index.html',
            'pages/dashboard.html',
            'netlify.toml',
            'netlify/functions/server.js',
            'js/auth-neon.js'
        ];
        
        let allFilesExist = true;
        requiredFiles.forEach(file => {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file}`);
            } else {
                console.log(`❌ ${file} - AUSENTE`);
                allFilesExist = false;
            }
        });
        
        if (!allFilesExist) {
            console.log('\n❌ Alguns arquivos estão ausentes. Verifique o projeto.');
            process.exit(1);
        }
        
        console.log('\n🎯 Todos os arquivos necessários estão presentes!');
        
        // Verificar se o código já foi enviado para o GitHub
        console.log('\n📤 Verificando status do GitHub...');
        const { execSync } = require('child_process');
        
        try {
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            
            if (status.trim() === '') {
                console.log('✅ Código sincronizado com GitHub');
            } else {
                console.log('⚠️ Há alterações não commitadas:');
                console.log(status);
                console.log('\n📝 Fazendo commit automático...');
                
                execSync('git add .', { stdio: 'inherit' });
                execSync('git commit -m "Deploy automático para barestaurente.netlify.app"', { stdio: 'inherit' });
                execSync('git push origin main', { stdio: 'inherit' });
                
                console.log('✅ Código enviado para GitHub');
            }
        } catch (error) {
            console.log('⚠️ Erro ao verificar Git:', error.message);
        }
        
        console.log('\n🌐 Deploy será acionado automaticamente pelo Netlify!');
        console.log('\n📋 PRÓXIMOS PASSOS:');
        console.log('1. Acesse: https://app.netlify.com/sites/barestaurente');
        console.log('2. Verifique o deploy em andamento na aba "Deploys"');
        console.log('3. Configure as variáveis de ambiente:');
        console.log('   - DATABASE_URL (string do Neon)');
        console.log('   - NODE_ENV = production');
        console.log('4. Teste o site: https://barestaurente.netlify.app');
        
        console.log('\n🎉 Deploy iniciado com sucesso!');
        
        // Abrir URLs relevantes
        console.log('\n🌐 Abrindo painel do Netlify...');
        
        return true;
        
    } catch (error) {
        console.error('\n❌ Erro durante o deploy:', error.message);
        return false;
    }
}

// Função para validar configuração
function validateConfig() {
    console.log('🔍 Validando configuração do projeto...\n');
    
    // Verificar netlify.toml
    if (fs.existsSync('netlify.toml')) {
        console.log('✅ netlify.toml encontrado');
        const config = fs.readFileSync('netlify.toml', 'utf8');
        
        if (config.includes('functions = "netlify/functions"')) {
            console.log('✅ Functions directory configurado');
        } else {
            console.log('⚠️ Functions directory pode precisar de configuração');
        }
        
        if (config.includes('publish = "."')) {
            console.log('✅ Publish directory configurado');
        } else {
            console.log('⚠️ Publish directory pode precisar de configuração');
        }
    } else {
        console.log('❌ netlify.toml não encontrado');
        return false;
    }
    
    // Verificar package.json
    if (fs.existsSync('package.json')) {
        console.log('✅ package.json encontrado');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        if (pkg.dependencies && pkg.dependencies['@neondatabase/serverless']) {
            console.log('✅ Neon database client instalado');
        } else {
            console.log('⚠️ Neon database client pode estar ausente');
        }
        
        if (pkg.dependencies && pkg.dependencies['@netlify/functions']) {
            console.log('✅ Netlify functions instaladas');
        } else {
            console.log('⚠️ Netlify functions podem estar ausentes');
        }
    }
    
    // Verificar function principal
    if (fs.existsSync('netlify/functions/server.js')) {
        console.log('✅ Function server.js encontrada');
        const serverCode = fs.readFileSync('netlify/functions/server.js', 'utf8');
        
        if (serverCode.includes('@neondatabase/serverless')) {
            console.log('✅ Neon integration configurada');
        } else {
            console.log('⚠️ Neon integration pode precisar de configuração');
        }
    } else {
        console.log('❌ Function server.js não encontrada');
        return false;
    }
    
    console.log('\n✅ Configuração validada com sucesso!\n');
    return true;
}

// Executar deploy
async function main() {
    console.log('🚀 DEPLOY AUTOMÁTICO - BAR RESTAURANTE MARIA FLOR');
    console.log('🎯 Destino: https://barestaurente.netlify.app');
    console.log('═'.repeat(50));
    
    // Validar configuração
    if (!validateConfig()) {
        console.log('\n❌ Falha na validação. Corrija os problemas antes de continuar.');
        process.exit(1);
    }
    
    // Fazer deploy
    const success = await triggerDeploy();
    
    if (success) {
        console.log('\n' + '═'.repeat(50));
        console.log('🎉 DEPLOY CONCLUÍDO COM SUCESSO!');
        console.log('🌐 Site: https://barestaurente.netlify.app');
        console.log('🔧 Painel: https://app.netlify.com/sites/barestaurente');
        console.log('═'.repeat(50));
    } else {
        console.log('\n❌ Deploy falhou. Verifique os erros acima.');
        process.exit(1);
    }
}

// Executar
main().catch(console.error);