#!/usr/bin/env node
/**
 * 🔍 Validação Pré-Deploy Railway
 * 
 * Este script verifica se o sistema está pronto para deploy no Railway
 * Execute: node scripts/validate-railway.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🔍 Validando configuração para Railway...\n');

let errors = 0;
let warnings = 0;

// ========================================
// 1. Verificar arquivos essenciais
// ========================================
console.log('📁 Verificando arquivos essenciais...\n');

const requiredFiles = [
    { path: 'railway.json', critical: true },
    { path: 'railway.toml', critical: true },
    { path: 'nixpacks.toml', critical: false },
    { path: 'Dockerfile', critical: false },
    { path: 'server/package.json', critical: true },
    { path: 'server/src/index.js', critical: true },
    { path: 'server/src/db.js', critical: true },
    { path: 'server/.env.example', critical: false },
];

requiredFiles.forEach(({ path: filePath, critical }) => {
    const fullPath = path.join(rootDir, filePath);
    const exists = fs.existsSync(fullPath);
    
    if (exists) {
        console.log(`✅ ${filePath}`);
    } else {
        if (critical) {
            console.log(`❌ ${filePath} - ARQUIVO CRÍTICO AUSENTE`);
            errors++;
        } else {
            console.log(`⚠️  ${filePath} - Arquivo opcional ausente`);
            warnings++;
        }
    }
});

// ========================================
// 2. Validar railway.json
// ========================================
console.log('\n📋 Validando railway.json...\n');

try {
    const railwayJsonPath = path.join(rootDir, 'railway.json');
    const railwayJson = JSON.parse(fs.readFileSync(railwayJsonPath, 'utf8'));
    
    if (railwayJson.build && railwayJson.build.builder) {
        console.log(`✅ Builder definido: ${railwayJson.build.builder}`);
    } else {
        console.log('⚠️  Builder não definido');
        warnings++;
    }
    
    if (railwayJson.deploy && railwayJson.deploy.startCommand) {
        console.log(`✅ Start command: ${railwayJson.deploy.startCommand}`);
    } else {
        console.log('❌ Start command não definido');
        errors++;
    }
    
    if (railwayJson.deploy && railwayJson.deploy.healthcheckPath) {
        console.log(`✅ Healthcheck: ${railwayJson.deploy.healthcheckPath}`);
    } else {
        console.log('⚠️  Healthcheck não configurado');
        warnings++;
    }
} catch (err) {
    console.log(`❌ Erro ao ler railway.json: ${err.message}`);
    errors++;
}

// ========================================
// 3. Validar package.json do servidor
// ========================================
console.log('\n📦 Validando package.json do servidor...\n');

try {
    const packageJsonPath = path.join(rootDir, 'server', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Verificar engines
    if (packageJson.engines && packageJson.engines.node) {
        console.log(`✅ Node version especificada: ${packageJson.engines.node}`);
    } else {
        console.log('⚠️  Node version não especificada em engines');
        warnings++;
    }
    
    // Verificar type: module
    if (packageJson.type === 'module') {
        console.log(`✅ Tipo ES Module configurado`);
    } else {
        console.log('⚠️  Type module não configurado');
        warnings++;
    }
    
    // Verificar scripts essenciais
    const requiredScripts = ['start', 'migrate'];
    requiredScripts.forEach(script => {
        if (packageJson.scripts && packageJson.scripts[script]) {
            console.log(`✅ Script "${script}": ${packageJson.scripts[script]}`);
        } else {
            console.log(`❌ Script "${script}" não encontrado`);
            errors++;
        }
    });
    
    // Verificar dependências críticas
    const criticalDeps = ['express', 'pg', 'dotenv', 'cors', 'jsonwebtoken'];
    criticalDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`✅ Dependência "${dep}": ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`❌ Dependência crítica "${dep}" ausente`);
            errors++;
        }
    });
    
} catch (err) {
    console.log(`❌ Erro ao ler server/package.json: ${err.message}`);
    errors++;
}

// ========================================
// 4. Verificar estrutura CSS responsiva
// ========================================
console.log('\n🎨 Verificando CSS responsivo...\n');

try {
    const cssPath = path.join(rootDir, 'css', 'design-system.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    const mediaQueries = cssContent.match(/@media/g);
    if (mediaQueries && mediaQueries.length >= 3) {
        console.log(`✅ Media queries encontradas: ${mediaQueries.length}`);
    } else {
        console.log('⚠️  Poucas media queries (menos de 3)');
        warnings++;
    }
    
    // Verificar breakpoints comuns
    const breakpoints = ['768px', '1024px', '640px', '480px'];
    const foundBreakpoints = breakpoints.filter(bp => cssContent.includes(bp));
    console.log(`✅ Breakpoints encontrados: ${foundBreakpoints.join(', ')}`);
    
} catch (err) {
    console.log(`⚠️  Erro ao validar CSS: ${err.message}`);
    warnings++;
}

// ========================================
// 5. Verificar configuração de API
// ========================================
console.log('\n🌐 Verificando config.js...\n');

try {
    const configPath = path.join(rootDir, 'js', 'config.js');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    if (configContent.includes('detectApiBaseUrl')) {
        console.log('✅ Detecção automática de API configurada');
    } else {
        console.log('⚠️  Detecção automática de API não encontrada');
        warnings++;
    }
    
    if (configContent.includes('railway.app')) {
        console.log('✅ Referência a Railway encontrada');
    } else {
        console.log('⚠️  Nenhuma referência a Railway no config');
        warnings++;
    }
    
} catch (err) {
    console.log(`⚠️  Erro ao validar config.js: ${err.message}`);
    warnings++;
}

// ========================================
// 6. Verificar migrations
// ========================================
console.log('\n🗄️  Verificando migrations...\n');

try {
    const migrationsDir = path.join(rootDir, 'server', 'src', 'migrations');
    const files = fs.readdirSync(migrationsDir);
    
    if (files.length > 0) {
        console.log(`✅ Migrations encontradas: ${files.join(', ')}`);
    } else {
        console.log('❌ Nenhuma migration encontrada');
        errors++;
    }
    
    // Verificar schema.sql
    const schemaPath = path.join(migrationsDir, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        const tables = schemaContent.match(/CREATE TABLE/gi);
        if (tables && tables.length >= 5) {
            console.log(`✅ Schema define ${tables.length} tabelas`);
        } else {
            console.log('⚠️  Poucas tabelas no schema');
            warnings++;
        }
    }
    
} catch (err) {
    console.log(`❌ Erro ao verificar migrations: ${err.message}`);
    errors++;
}

// ========================================
// 7. Verificar .gitignore
// ========================================
console.log('\n🔒 Verificando .gitignore...\n');

try {
    const gitignorePath = path.join(rootDir, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        
        const criticalPatterns = ['.env', 'node_modules', '*.log'];
        criticalPatterns.forEach(pattern => {
            if (gitignoreContent.includes(pattern)) {
                console.log(`✅ Padrão ignorado: ${pattern}`);
            } else {
                console.log(`⚠️  Padrão "${pattern}" não está no .gitignore`);
                warnings++;
            }
        });
    } else {
        console.log('⚠️  .gitignore não encontrado');
        warnings++;
    }
} catch (err) {
    console.log(`⚠️  Erro ao verificar .gitignore: ${err.message}`);
    warnings++;
}

// ========================================
// RESULTADO FINAL
// ========================================
console.log('\n' + '='.repeat(60));
console.log('📊 RESULTADO DA VALIDAÇÃO');
console.log('='.repeat(60) + '\n');

console.log(`❌ Erros críticos: ${errors}`);
console.log(`⚠️  Avisos: ${warnings}`);

if (errors === 0 && warnings === 0) {
    console.log('\n✅ 🎉 SISTEMA PRONTO PARA DEPLOY NO RAILWAY!\n');
    console.log('Próximos passos:');
    console.log('1. Commit e push das alterações');
    console.log('2. Criar projeto no Railway');
    console.log('3. Adicionar PostgreSQL');
    console.log('4. Configurar variáveis de ambiente');
    console.log('5. Deploy automático!\n');
    console.log('📖 Consulte GUIA_DEPLOY_RAILWAY.md para detalhes\n');
    process.exit(0);
} else if (errors === 0) {
    console.log('\n⚠️  Sistema pode ser deployado, mas há avisos.');
    console.log('Revise os avisos acima para otimizar a configuração.\n');
    process.exit(0);
} else {
    console.log('\n❌ Sistema NÃO está pronto para deploy.');
    console.log('Corrija os erros críticos listados acima.\n');
    process.exit(1);
}
