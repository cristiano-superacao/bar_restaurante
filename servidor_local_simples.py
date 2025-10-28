#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor HTTP simples para testar o sistema Bar Restaurante localmente
"""

import http.server
import socketserver
import os
import json
from urllib.parse import urlparse, parse_qs
import threading
import webbrowser

# Configurações
PORT = 8080
DIRECTORY = "."

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Adicionar headers CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        # Roteamento personalizado
        parsed_path = urlparse(self.path)
        
        # Rota para dashboard
        if self.path == '/dashboard':
            self.path = '/pages/dashboard.html'
        
        # Rota para login
        elif self.path == '/login':
            self.path = '/index.html'
        
        # API de teste
        elif self.path.startswith('/api/test'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'message': 'API funcionando em modo demo',
                'timestamp': '2025-10-28T10:00:00Z',
                'database': 'demo'
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            return
        
        # API de dashboard
        elif self.path.startswith('/api/dashboard'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': {
                    'vendas': {
                        'hoje': 2500.00,
                        'ontem': 2100.00,
                        'semana': 15750.00,
                        'mes': 67500.00
                    },
                    'pedidos': {
                        'pendentes': 8,
                        'preparando': 12,
                        'prontos': 3,
                        'entregues': 47
                    },
                    'mesas': {
                        'ocupadas': 15,
                        'livres': 5,
                        'total': 20
                    }
                }
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            return
        
        # Fallback para SPA - retornar index.html para rotas não encontradas
        elif not os.path.exists(self.path.lstrip('/')):
            self.path = '/index.html'
        
        # Chamar o handler padrão
        super().do_GET()
    
    def do_POST(self):
        # API de login
        if self.path.startswith('/api/auth/login'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                email = data.get('email', '')
                senha = data.get('senha', '')
                
                # Credenciais demo
                valid_users = {
                    'admin@mariaflor.com.br': {'senha': 'admin123', 'nome': 'Administrador', 'role': 'admin'},
                    'gerente@mariaflor.com.br': {'senha': 'gerente123', 'nome': 'Gerente', 'role': 'gerente'},
                    'usuario@mariaflor.com.br': {'senha': 'usuario123', 'nome': 'Usuário', 'role': 'usuario'}
                }
                
                if email in valid_users and valid_users[email]['senha'] == senha:
                    response = {
                        'success': True,
                        'user': {
                            'id': 1,
                            'nome': valid_users[email]['nome'],
                            'email': email,
                            'role': valid_users[email]['role']
                        },
                        'token': 'demo-token-123'
                    }
                    status_code = 200
                else:
                    response = {
                        'success': False,
                        'message': 'Credenciais inválidas'
                    }
                    status_code = 401
                
                self.send_response(status_code)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'success': False, 'message': 'JSON inválido'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
            return
        
        # Outros endpoints POST
        self.send_response(404)
        self.end_headers()
    
    def do_OPTIONS(self):
        # Handle preflight CORS requests
        self.send_response(200)
        self.end_headers()

def start_server():
    """Inicia o servidor HTTP"""
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor Python iniciado!")
        print(f"📍 Endereço: http://localhost:{PORT}")
        print(f"📁 Diretório: {os.getcwd()}")
        print(f"🔗 URLs disponíveis:")
        print(f"   • Site principal: http://localhost:{PORT}")
        print(f"   • Dashboard: http://localhost:{PORT}/dashboard")
        print(f"   • API teste: http://localhost:{PORT}/api/test")
        print(f"   • Login: http://localhost:{PORT}/login")
        print()
        print("⚠️  Credenciais de teste:")
        print("   • admin@mariaflor.com.br / admin123")
        print("   • gerente@mariaflor.com.br / gerente123") 
        print("   • usuario@mariaflor.com.br / usuario123")
        print()
        print("🛑 Para parar o servidor: Ctrl+C")
        print("-" * 50)
        
        # Abrir navegador automaticamente após 2 segundos
        def open_browser():
            import time
            time.sleep(2)
            webbrowser.open(f'http://localhost:{PORT}')
        
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado pelo usuário")
            httpd.shutdown()

if __name__ == "__main__":
    start_server()