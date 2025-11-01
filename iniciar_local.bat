@echo off
cd /d "c:\Users\bivol\Desktop\SENAI\Cristiano_Santos\Restaurante"
echo.
echo 🚀 BAR RESTAURANTE MARIA FLOR - SERVIDOR LOCAL
echo ================================================
echo 📂 Diretorio: %CD%
echo 🌐 URL: http://localhost:8000
echo 🔑 Credenciais: admin/admin123, gerente/gerente123
echo.
echo ⏳ Iniciando servidor...
timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"
python -m http.server 8000
pause