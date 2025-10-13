#!/bin/bash

# Script para configurar variáveis de ambiente no Netlify
# Execute este script após fazer o deploy

echo "🚀 Configurando variáveis de ambiente no Netlify..."

# Certifique-se de ter o Netlify CLI instalado
# npm install -g netlify-cli

# Login no Netlify (se necessário)
echo "🔐 Fazendo login no Netlify..."
netlify login

# Configurar variáveis de ambiente
echo "⚙️ Configurando variáveis..."

# JWT Secret
netlify env:set JWT_SECRET "maria-flor-netlify-secret-2024-super-seguro"

# Ambiente
netlify env:set NODE_ENV "production"

# Timezone
netlify env:set TZ "America/Sao_Paulo"

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️ DATABASE_URL não definida. Sistema funcionará em modo local."
    echo "💡 Para configurar o Neon:"
    echo "   1. Crie uma conta em https://neon.tech"
    echo "   2. Crie um projeto"
    echo "   3. Execute: netlify env:set DATABASE_URL 'sua_connection_string'"
else
    echo "✅ Configurando DATABASE_URL..."
    netlify env:set DATABASE_URL "$DATABASE_URL"
fi

echo "✅ Configuração concluída!"
echo "🌐 Acesse: https://barestaurente.netlify.app"
echo "📊 Dashboard: https://app.netlify.com/sites/barestaurente/settings/env-vars"