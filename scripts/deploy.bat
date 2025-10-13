@echo off
REM Script para deploy no Netlify (Windows)

echo 🚀 Iniciando deploy no Netlify...

REM Verificar se está em um repositório git
if not exist ".git" (
    echo ❌ Este não é um repositório git. Inicializando...
    git init
    git add .
    git commit -m "Initial commit"
)

REM Verificar se o arquivo .env existe
if not exist ".env" (
    echo ⚠️  Arquivo .env não encontrado. Copiando exemplo...
    copy .env.example .env
    echo ✅ Configure as variáveis em .env antes do deploy em produção
)

REM Instalar dependências
echo 📦 Instalando dependências...
npm install

REM Build do projeto
echo 🔨 Executando build...
npm run build

REM Deploy
echo 🌐 Fazendo deploy no Netlify...
where netlify >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    netlify deploy --prod
) else (
    echo ❌ Netlify CLI não encontrado. Instale com: npm install -g netlify-cli
    echo Depois execute: netlify login e netlify init
)

echo ✅ Deploy concluído!
pause