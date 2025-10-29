@echo off
cls
echo.
echo ==============================================================
echo     BAR RESTAURANTE MARIA FLOR - INICIALIZACAO RAPIDA
echo ==============================================================
echo.

REM Navegar para o diretório do projeto
cd /d "%~dp0.."

REM Verificar arquivos essenciais
if not exist "index.html" (
    echo ❌ Arquivo index.html nao encontrado!
    echo 📁 Execute este script na pasta raiz do projeto
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados!
echo.

REM Tentar iniciar com Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo 🐍 Python encontrado - Iniciando servidor personalizado...
    echo.
    python utils\dev-server.py
) else (
    echo ⚠️ Python nao encontrado
    echo 📥 Instale Python: https://python.org/downloads
    echo.
    echo 🔄 Tentando usar Node.js...
    
    REM Verificar Node.js
    node --version >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ Node.js encontrado!
        echo 🌐 Iniciando servidor HTTP...
        echo.
        echo 📍 Acesse: http://localhost:8080
        echo 🔑 Credenciais: admin / admin123
        echo.
        npx http-server . -p 8080 -c-1 -o
    ) else (
        echo ❌ Node.js tambem nao encontrado!
        echo.
        echo 📥 Instale uma das opcoes:
        echo    • Python: https://python.org/downloads
        echo    • Node.js: https://nodejs.org
        echo.
        echo 💡 Ou abra o arquivo index.html diretamente no navegador
    )
)

echo.
pause