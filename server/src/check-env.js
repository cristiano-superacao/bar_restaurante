/**
 * 🔍 Script de Verificação de Ambiente
 * 
 * Este script verifica se todas as variáveis de ambiente necessárias
 * estão configuradas corretamente antes do deploy.
 * 
 * Execute localmente: node server/src/check-env.js
 * Ou no Railway: adicione em Build Command
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carrega variáveis do .env se existir
dotenv.config({ path: join(__dirname, '..', '.env') });

console.log('🔍 Verificando configuração do ambiente...\n');

// Variáveis obrigatórias
const requiredVars = {
  'DATABASE_URL': {
    value: process.env.DATABASE_URL,
    description: 'Connection string do PostgreSQL',
    example: 'postgresql://user:password@host:5432/database',
    critical: true,
  },
  'JWT_SECRET': {
    value: process.env.JWT_SECRET,
    description: 'Chave secreta para JWT (mínimo 32 caracteres)',
    example: 'sua-chave-secreta-muito-longa-e-aleatoria',
    critical: true,
  },
  'PORT': {
    value: process.env.PORT,
    description: 'Porta do servidor',
    example: '3000',
    critical: false,
    default: '3000',
  },
};

// Variáveis opcionais
const optionalVars = {
  'CORS_ORIGIN': {
    value: process.env.CORS_ORIGIN,
    description: 'Origem permitida para CORS',
    example: 'https://seu-frontend.vercel.app',
    default: '*',
  },
  'NODE_ENV': {
    value: process.env.NODE_ENV,
    description: 'Ambiente de execução',
    example: 'production',
    default: 'development',
  },
};

let hasErrors = false;
let hasWarnings = false;

// Verifica variáveis obrigatórias
console.log('📋 Variáveis Obrigatórias:\n');
for (const [key, config] of Object.entries(requiredVars)) {
  const value = config.value || config.default;
  
  if (!value) {
    console.log(`❌ ${key}`);
    console.log(`   Descrição: ${config.description}`);
    console.log(`   Exemplo: ${config.example}`);
    console.log(`   Status: NÃO DEFINIDA\n`);
    if (config.critical) {
      hasErrors = true;
    } else {
      hasWarnings = true;
    }
  } else {
    // Validações específicas
    let valid = true;
    let message = '';

    if (key === 'JWT_SECRET' && value.length < 32) {
      valid = false;
      message = `⚠️  Muito curta (${value.length} caracteres, mínimo 32)`;
      hasWarnings = true;
    }

    if (key === 'DATABASE_URL' && !value.startsWith('postgresql://')) {
      valid = false;
      message = '⚠️  Formato inválido (deve começar com postgresql://)';
      hasWarnings = true;
    }

    if (valid) {
      console.log(`✅ ${key}`);
      console.log(`   Valor: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
    } else {
      console.log(`⚠️  ${key}`);
      console.log(`   Valor: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`);
      console.log(`   ${message}`);
    }
    console.log(`   Descrição: ${config.description}\n`);
  }
}

// Verifica variáveis opcionais
console.log('📋 Variáveis Opcionais:\n');
for (const [key, config] of Object.entries(optionalVars)) {
  const value = config.value || config.default;
  
  if (!config.value) {
    console.log(`ℹ️  ${key}`);
    console.log(`   Descrição: ${config.description}`);
    console.log(`   Usando padrão: ${config.default}\n`);
  } else {
    console.log(`✅ ${key}`);
    console.log(`   Valor: ${value}`);
    console.log(`   Descrição: ${config.description}\n`);
  }
}

// Testa conexão com banco (se possível)
console.log('🔗 Testando conexão com banco de dados...\n');

if (requiredVars.DATABASE_URL.value) {
  try {
    const { pool } = await import('./db.js');
    
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log('✅ Conexão com banco de dados: OK');
    console.log(`   Timestamp: ${result.rows[0].time}`);
    console.log(`   Versão: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}\n`);
    
    // Verifica se as tabelas existem
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('📊 Tabelas no banco de dados:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  Nenhuma tabela encontrada - migrações ainda não executadas\n');
      hasWarnings = true;
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
      console.log('');
    }
    
    await pool.end();
  } catch (error) {
    console.log('❌ Erro ao conectar com banco de dados:');
    console.log(`   ${error.message}\n`);
    hasErrors = true;
  }
} else {
  console.log('⏭️  DATABASE_URL não definida - pulando teste de conexão\n');
}

// Resumo final
console.log('━'.repeat(60));
console.log('📊 RESUMO DA VERIFICAÇÃO\n');

if (!hasErrors && !hasWarnings) {
  console.log('✅ Todas as verificações passaram!');
  console.log('   O ambiente está pronto para deploy.\n');
  process.exit(0);
} else if (hasErrors) {
  console.log('❌ Erros críticos encontrados!');
  console.log('   Configure as variáveis obrigatórias antes de fazer deploy.\n');
  console.log('📖 Consulte o arquivo RAILWAY_SETUP.md para instruções detalhadas.\n');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  Avisos encontrados!');
  console.log('   O deploy pode funcionar, mas algumas configurações devem ser revisadas.\n');
  console.log('📖 Consulte o arquivo RAILWAY_SETUP.md para instruções detalhadas.\n');
  process.exit(0);
}
