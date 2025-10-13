@echo off
echo.
echo ==========================================
echo    CONFIGURANDO NETLIFY PARA MARIA FLOR
echo ==========================================
echo.

REM Verificar se Netlify CLI está instalado
where netlify >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Netlify CLI não encontrado. Instalando...
    npm install -g netlify-cli
    echo.
)

echo 🔐 Fazendo login no Netlify...
netlify login
echo.

echo ⚙️ Configurando variáveis de ambiente...
echo.

REM Configurar variáveis obrigatórias
netlify env:set JWT_SECRET "maria-flor-netlify-secret-2024-super-seguro"
netlify env:set NODE_ENV "production"
netlify env:set TZ "America/Sao_Paulo"

echo.
echo ✅ Variáveis básicas configuradas!
echo.

REM Verificar DATABASE_URL
echo 💡 Para configurar o banco Neon (OPCIONAL):
echo 1. Acesse: https://neon.tech
echo 2. Crie uma conta e projeto
echo 3. Execute: netlify env:set DATABASE_URL "sua_connection_string"
echo.

echo 🚀 Fazendo deploy...
netlify deploy --prod
echo.

echo ==========================================
echo ✅ DEPLOY CONCLUÍDO!
echo ==========================================
echo.
echo 🌐 Seu sistema estará disponível em:
echo 👉 https://barestaurente.netlify.app
echo.
echo 📊 Configurações do Netlify:
echo 👉 https://app.netlify.com/sites/barestaurente/settings
echo.
echo 🔐 Credenciais de teste:
echo Admin: admin / MariaFlor2025!
echo Gerente: gerente / Gerente123!
echo Garçom: garcom1 / Garcom123!
echo.
echo 📝 Próximos passos:
echo 1. Teste o login no site
echo 2. Configure o Neon se desejar (opcional)
echo 3. Monitore os logs se necessário
echo.
pause