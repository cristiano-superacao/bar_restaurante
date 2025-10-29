#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor de Desenvolvimento Local - Bar Restaurante Maria Flor
Inicialização simplificada para desenvolvimento
"""

import os
import sys
import http.server
import socketserver
import webbrowser
import threading
import time
import json
from pathlib import Path

# Configurações
PORT = 8000
HOST = 'localhost'
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Headers CORS para desenvolvimento
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Log de acesso
        print(f"📂 {self.command} {self.path}")
        
        # Roteamento personalizado
        if self.path == '/':
            self.path = '/index.html'
        elif self.path == '/dashboard':
            self.path = '/pages/dashboard.html'
        elif self.path == '/test':
            self.path = '/docs/teste-local.html'
        elif self.path == '/status':
            self.path = '/docs/status.html'
        
        # Chamar handler padrão
        super().do_GET()
    
    def log_message(self, format, *args):
        # Log customizado mais limpo
        timestamp = time.strftime('%H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def print_banner():
    """Exibe banner de inicialização"""
    print("\n" + "="*60)
    print("🍽️  BAR RESTAURANTE MARIA FLOR - SERVIDOR LOCAL")
    print("="*60)
    print(f"📂 Diretório: {DIRECTORY}")
    print(f"🌐 URL: http://{HOST}:{PORT}")
    print(f"🐍 Python: {sys.version.split()[0]}")
    print("\n📍 URLS DISPONÍVEIS:")
    print(f"   • Principal: http://{HOST}:{PORT}")
    print(f"   • Dashboard: http://{HOST}:{PORT}/dashboard")
    print(f"   • Testes: http://{HOST}:{PORT}/test")
    print(f"   • Status: http://{HOST}:{PORT}/status")
    print("\n🔑 CREDENCIAIS DE TESTE:")
    print("   • admin / admin123")
    print("   • gerente / gerente123")
    print("   • garcom / garcom123")
    print("\n🛑 Para parar: Ctrl+C")
    print("="*60)

def open_browser():
    """Abre navegador após delay"""
    time.sleep(2)
    url = f"http://{HOST}:{PORT}"
    print(f"🌐 Abrindo navegador: {url}")
    try:
        webbrowser.open(url)
    except Exception as e:
        print(f"⚠️ Não foi possível abrir o navegador: {e}")

def check_files():
    """Verifica se arquivos essenciais existem"""
    essential_files = [
        'index.html',
        'js/config.js',
        'js/auth-neon.js',
        'css/login.css',
        'pages/dashboard.html'
    ]
    
    missing = []
    for file in essential_files:
        if not (DIRECTORY / file).exists():
            missing.append(file)
    
    if missing:
        print(f"⚠️ Arquivos faltando: {', '.join(missing)}")
        return False
    
    print("✅ Todos os arquivos essenciais encontrados")
    return True

def main():
    """Função principal"""
    print_banner()
    
    # Verificar arquivos
    if not check_files():
        print("\n❌ Sistema incompleto. Verifique os arquivos.")
        return
    
    # Configurar servidor
    os.chdir(DIRECTORY)
    
    try:
        with socketserver.TCPServer((HOST, PORT), CustomHTTPRequestHandler) as httpd:
            print(f"\n🚀 Servidor iniciado em http://{HOST}:{PORT}")
            
            # Abrir navegador em thread separada
            browser_thread = threading.Thread(target=open_browser, daemon=True)
            browser_thread.start()
            
            # Iniciar servidor
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n\n🛑 Servidor parado pelo usuário")
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"\n❌ Porta {PORT} já está em uso. Tente outra porta.")
        else:
            print(f"\n❌ Erro ao iniciar servidor: {e}")
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main()