#!/bin/bash

# Script para deploy no Netlify

echo "🚀 Iniciando deploy no Netlify..."

# Verificar se está em um repositório git
if [ ! -d ".git" ]; then
    echo "❌ Este não é um repositório git. Inicializando..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    echo "⚠️  Arquivo .env não encontrado. Copiando exemplo..."
    cp .env.example .env
    echo "✅ Configure as variáveis em .env antes do deploy em produção"
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Build do projeto
echo "🔨 Executando build..."
npm run build

# Deploy
echo "🌐 Fazendo deploy no Netlify..."
if command -v netlify &> /dev/null; then
    netlify deploy --prod
else
    echo "❌ Netlify CLI não encontrado. Instale com: npm install -g netlify-cli"
    echo "Depois execute: netlify login && netlify init"
fi

echo "✅ Deploy concluído!"