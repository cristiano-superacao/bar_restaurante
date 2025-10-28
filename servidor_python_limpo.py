#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor HTTP simples para Bar Restaurante Maria Flor
Porta: 8080
"""

import http.server
import socketserver
import os
import json
import threading
import webbrowser
from urllib.parse import urlparse, parse_qs

PORT = 8080
DIRECTORY = "."

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        # Roteamento personalizado
        if self.path == '/dashboard':
            self.path = '/pages/dashboard.html'
        elif self.path == '/login':
            self.path = '/index.html'
        elif self.path.startswith('/api/test'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'message': 'API funcionando em modo demo',
                'timestamp': '2025-10-28T12:00:00Z',
                'database': 'demo'
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            return
        elif self.path.startswith('/api/dashboard'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {
                'success': True,
                'data': {
                    'vendas': {'hoje': 2500.00, 'ontem': 2100.00, 'semana': 15750.00, 'mes': 67500.00},
                    'pedidos': {'pendentes': 8, 'preparando': 12, 'prontos': 3, 'entregues': 47},
                    'mesas': {'ocupadas': 15, 'livres': 5, 'total': 20}
                }
            }
            self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            return
        elif not os.path.exists(self.path.lstrip('/')):
            self.path = '/index.html'
        
        super().do_GET()
    
    def do_POST(self):
        if self.path.startswith('/api/auth/login'):
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                email = data.get('email', '')
                senha = data.get('senha', '')
                
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
                    response = {'success': False, 'message': 'Credenciais inválidas'}
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
        
        self.send_response(404)
        self.end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()
    
    def log_message(self, format, *args):
        # Evitar spam de logs
        if not any(x in args[0] for x in ['.css', '.js', '.ico', '.png', '.jpg']):
            super().log_message(format, *args)

def start_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print("🚀 Servidor Python HTTP iniciado!")
        print(f"📍 URL: http://localhost:{PORT}")
        print(f"📁 Diretório: {os.getcwd()}")
        print()
        print("🔗 URLs disponíveis:")
        print(f"   • Site: http://localhost:{PORT}")
        print(f"   • Dashboard: http://localhost:{PORT}/dashboard")
        print(f"   • API teste: http://localhost:{PORT}/api/test")
        print()
        print("🔑 Credenciais:")
        print("   • admin@mariaflor.com.br / admin123")
        print("   • gerente@mariaflor.com.br / gerente123")
        print("   • usuario@mariaflor.com.br / usuario123")
        print()
        print("🛑 Para parar: Ctrl+C")
        print("-" * 50)
        
        # Abrir navegador após 2 segundos
        def open_browser():
            import time
            time.sleep(2)
            try:
                webbrowser.open(f'http://localhost:{PORT}')
            except:
                pass
        
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Servidor parado")

if __name__ == "__main__":
    start_server()