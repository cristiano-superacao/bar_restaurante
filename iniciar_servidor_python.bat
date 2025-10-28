@echo off
echo ==========================================
echo   🍽️ BAR RESTAURANTE MARIA FLOR
echo   🐍 Servidor Python Local
echo ==========================================
echo.

cd /d "%~dp0"

echo 🔍 Verificando Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo 📥 Instale o Python em: https://python.org
    pause
    exit /b 1
)

echo ✅ Python encontrado!
echo 🚀 Iniciando servidor local...
echo.

python servidor_local_simples.py

echo.
echo 🛑 Servidor finalizado.
pause