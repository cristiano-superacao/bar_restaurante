@echo off
chcp 65001 >nul
title Sistema Maria Flor - Servidor Python Local

echo.
echo ============================================
echo   🌟 MARIA FLOR - SERVIDOR PYTHON LOCAL
echo ============================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python não encontrado!
    echo.
    echo 💡 Instale Python em: https://www.python.org/downloads/
    echo    Marque a opção "Add Python to PATH" durante a instalação
    echo.
    pause
    exit /b 1
)

echo ✅ Python encontrado
echo 🚀 Iniciando servidor...
echo.
echo 🔗 Servidor será aberto em: http://localhost:8080
echo 🔑 Use as credenciais: admin / MariaFlor2025!
echo.
echo ⚠️  Pressione Ctrl+C para parar o servidor
echo =============================================
echo.

REM Iniciar servidor Python
python servidor_local.py

echo.
echo 🛑 Servidor parado.
pause