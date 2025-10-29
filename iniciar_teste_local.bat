@echo off
echo.
echo 🚀 Iniciando Servidor Local - Bar Restaurante Maria Flor
echo ============================================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ❌ Erro: arquivo index.html não encontrado!
    echo 📁 Execute este script na pasta raiz do projeto
    pause
    exit /b 1
)

echo ✅ Arquivos encontrados!
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não instalado. Tentando usar Node.js...
    
    REM Verificar Node.js
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Node.js também não encontrado!
        echo.
        echo 📥 Instale Python ou Node.js:
        echo    • Python: https://python.org/downloads
        echo    • Node.js: https://nodejs.org
        pause
        exit /b 1
    ) else (
        echo ✅ Node.js encontrado!
        echo 🌐 Iniciando servidor na porta 8000...
        echo.
        echo 📍 URLs disponíveis:
        echo    • http://localhost:8000
        echo    • http://127.0.0.1:8000
        echo.
        echo 🔑 Credenciais de teste:
        echo    • admin@mariaflor.com.br / admin123
        echo    • gerente@mariaflor.com.br / gerente123
        echo.
        echo 🛑 Pressione Ctrl+C para parar
        echo ============================================================
        echo.
        
        REM Abrir navegador em 3 segundos
        timeout /t 3 /nobreak >nul
        start http://localhost:8000
        
        REM Iniciar servidor Node.js
        npx http-server . -p 8000 -c-1
    )
) else (
    echo ✅ Python encontrado!
    echo 🌐 Iniciando servidor na porta 8000...
    echo.
    echo 📍 URLs disponíveis:
    echo    • http://localhost:8000
    echo    • http://127.0.0.1:8000
    echo.
    echo 🔑 Credenciais de teste:
    echo    • admin@mariaflor.com.br / admin123
    echo    • gerente@mariaflor.com.br / gerente123
    echo.
    echo 🛑 Pressione Ctrl+C para parar
    echo ============================================================
    echo.
    
    REM Abrir navegador em 3 segundos
    timeout /t 3 /nobreak >nul
    start http://localhost:8000
    
    REM Iniciar servidor Python
    python -m http.server 8000
)

pause