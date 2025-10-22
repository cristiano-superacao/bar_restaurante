#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Servidor Local Python para Sistema Maria Flor
Servidor HTTP simples para desenvolvimento e teste local
"""

import http.server
import socketserver
import os
import sys
import webbrowser
import threading
import time
import json
from urllib.parse import urlparse, parse_qs
from datetime import datetime

# Configurações
PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

# Dados simulados para teste
USUARIOS_TESTE = {
    'admin': {'senha': 'MariaFlor2025!', 'nome': 'Administrador', 'role': 'admin'},
    'gerente': {'senha': 'Gerente123!', 'nome': 'Gerente Geral', 'role': 'gerente'},
    'garcom1': {'senha': 'Garcom123!', 'nome': 'Ana Silva', 'role': 'garcom'},
    'garcom2': {'senha': 'Garcom123!', 'nome': 'João Santos', 'role': 'garcom'},
    'cozinha1': {'senha': 'Cozinha123!', 'nome': 'Maria José', 'role': 'cozinha'},
    'cozinha2': {'senha': 'Cozinha123!', 'nome': 'Pedro Oliveira', 'role': 'cozinha'},
    'caixa1': {'senha': 'Caixa123!', 'nome': 'Carla Lima', 'role': 'caixa'},
    'caixa2': {'senha': 'Caixa123!', 'nome': 'Roberto Costa', 'role': 'caixa'},
    'estoque1': {'senha': 'Estoque123!', 'nome': 'Fernanda Souza', 'role': 'estoque'},
    'estoque2': {'senha': 'Estoque123!', 'nome': 'Carlos Pereira', 'role': 'estoque'}
}

DADOS_DASHBOARD = {
    'vendas_hoje': 1250.75,
    'pedidos_pendentes': 5,
    'produtos_vendidos': 47,
    'ticket_medio': 26.61,
    'vendas_semana': [120, 135, 180, 95, 220, 340, 280],
    'top_produtos': [
        {'nome': 'X-Bacon', 'quantidade': 12, 'valor': 180.00},
        {'nome': 'Coca-Cola 350ml', 'quantidade': 18, 'valor': 108.00},
        {'nome': 'Batata Frita', 'quantidade': 8, 'valor': 64.00},
        {'nome': 'Pizza Margherita', 'quantidade': 4, 'valor': 120.00},
        {'nome': 'Cerveja Brahma', 'quantidade': 15, 'valor': 90.00}
    ]
}

class MariaFlorHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Handler customizado para o Sistema Maria Flor"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        """Adicionar headers CORS para desenvolvimento"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()
    
    def do_OPTIONS(self):
        """Lidar com requisições OPTIONS (CORS preflight)"""
        self.send_response(200)
        self.end_headers()
    
    def do_POST(self):
        """Lidar com requisições POST para API"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            super().do_POST()
    
    def do_GET(self):
        """Lidar com requisições GET"""
        if self.path.startswith('/api/'):
            self.handle_api_request()
        else:
            # Redirecionar / para index.html
            if self.path == '/':
                self.path = '/index.html'
            super().do_GET()
    
    def handle_api_request(self):
        """Lidar com requisições da API simulada"""
        try:
            content_length = int(self.headers.get('content-length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b''
            
            # Parse JSON se houver dados
            data = {}
            if post_data:
                try:
                    data = json.loads(post_data.decode('utf-8'))
                except json.JSONDecodeError:
                    pass
            
            response = {}
            status_code = 200
            
            # Roteamento da API
            if '/api/auth/login' in self.path:
                response = self.handle_login(data)
            elif '/api/dashboard' in self.path:
                response = self.handle_dashboard()
            elif '/api/users' in self.path:
                response = self.handle_users()
            else:
                response = {'success': False, 'error': 'Endpoint não encontrado'}
                status_code = 404
            
            # Enviar resposta
            self.send_response(status_code)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            response_json = json.dumps(response, ensure_ascii=False, indent=2)
            self.wfile.write(response_json.encode('utf-8'))
            
        except Exception as e:
            # Erro interno
            self.send_response(500)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            error_response = {
                'success': False,
                'error': f'Erro interno do servidor: {str(e)}'
            }
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def handle_login(self, data):
        """Lidar com login"""
        username = data.get('username', '')
        password = data.get('password', '')
        
        if username in USUARIOS_TESTE:
            user_data = USUARIOS_TESTE[username]
            if user_data['senha'] == password:
                return {
                    'success': True,
                    'message': 'Login realizado com sucesso',
                    'token': f'token-{username}-{int(time.time())}',
                    'user': {
                        'id': hash(username) % 1000,
                        'username': username,
                        'nome': user_data['nome'],
                        'role': user_data['role']
                    },
                    'redirectTo': 'pages/dashboard.html'
                }
        
        return {
            'success': False,
            'error': 'Credenciais inválidas'
        }
    
    def handle_dashboard(self):
        """Lidar com dados do dashboard"""
        return {
            'success': True,
            'data': DADOS_DASHBOARD
        }
    
    def handle_users(self):
        """Lidar com lista de usuários"""
        users = []
        for username, data in USUARIOS_TESTE.items():
            users.append({
                'id': hash(username) % 1000,
                'username': username,
                'nome': data['nome'],
                'role': data['role']
            })
        
        return {
            'success': True,
            'data': users
        }
    
    def log_message(self, format, *args):
        """Log personalizado"""
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {format % args}")

def open_browser():
    """Abrir navegador após 2 segundos"""
    time.sleep(2)
    try:
        webbrowser.open(f'http://localhost:{PORT}')
        print(f"🌐 Navegador aberto em http://localhost:{PORT}")
    except Exception as e:
        print(f"⚠️  Não foi possível abrir o navegador: {e}")
        print(f"🔗 Acesse manualmente: http://localhost:{PORT}")

def main():
    """Função principal"""
    print("=" * 50)
    print("🌟 SISTEMA MARIA FLOR - SERVIDOR LOCAL")
    print("=" * 50)
    print(f"📁 Diretório: {DIRECTORY}")
    print(f"🌐 Porta: {PORT}")
    print()
    
    try:
        # Mudar para o diretório do projeto
        os.chdir(DIRECTORY)
        
        # Configurar servidor
        with socketserver.TCPServer(("", PORT), MariaFlorHTTPRequestHandler) as httpd:
            print("✅ Servidor iniciado com sucesso!")
            print(f"🔗 Acesse: http://localhost:{PORT}")
            print()
            print("🔑 Credenciais de teste:")
            print("   admin / MariaFlor2025!")
            print("   gerente / Gerente123!")
            print("   garcom1 / Garcom123!")
            print()
            print("⚠️  Pressione Ctrl+C para parar o servidor")
            print("=" * 50)
            
            # Abrir navegador em thread separada
            browser_thread = threading.Thread(target=open_browser)
            browser_thread.daemon = True
            browser_thread.start()
            
            # Iniciar servidor
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except OSError as e:
        if e.errno == 10048:  # Porta em uso
            print(f"❌ Porta {PORT} já está em uso!")
            print("💡 Tente fechar outros servidores ou use uma porta diferente")
        else:
            print(f"❌ Erro ao iniciar servidor: {e}")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main()