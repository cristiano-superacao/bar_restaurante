/**
 * Sistema de Autenticação Simplificado - Maria Flor
 * Versão otimizada para servidor Python local
 */

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiUrl = '/api';
        this.init();
    }

    init() {
        // Verificar se já existe login salvo
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('currentUser');
        
        if (savedToken && savedUser) {
            try {
                this.token = savedToken;
                this.currentUser = JSON.parse(savedUser);
                console.log('✅ Sessão restaurada:', this.currentUser.username);
            } catch (error) {
                console.warn('⚠️ Erro ao restaurar sessão:', error);
                this.logout();
            }
        }
    }

    async login(username, password) {
        try {
            console.log('🔐 Tentando login:', username);
            
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.token = data.token;
                this.currentUser = data.user;
                
                // Salvar no localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                console.log('✅ Login bem-sucedido:', this.currentUser);
                
                return {
                    success: true,
                    message: `Bem-vindo, ${this.currentUser.nome}!`,
                    redirectTo: data.redirectTo
                };
            } else {
                console.log('❌ Login falhou:', data.error);
                return {
                    success: false,
                    error: data.error
                };
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return {
                success: false,
                error: 'Erro de conexão. Verifique se o servidor está rodando.'
            };
        }
    }

    logout() {
        console.log('🚪 Fazendo logout...');
        
        this.currentUser = null;
        this.token = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        // Redirecionar para login
        if (window.location.pathname !== '/' && !window.location.pathname.includes('index.html')) {
            window.location.href = '../index.html';
        }
    }

    isLoggedIn() {
        return this.currentUser !== null && this.token !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getToken() {
        return this.token;
    }

    hasPermission(permission) {
        if (!this.isLoggedIn()) return false;
        
        const role = this.currentUser.role;
        
        // Admin tem acesso a tudo
        if (role === 'admin') return true;
        
        // Definir permissões por role
        const permissions = {
            gerente: ['vendas', 'pedidos', 'cardapio', 'estoque', 'financeiro'],
            garcom: ['vendas', 'pedidos'],
            cozinha: ['pedidos', 'cardapio'],
            caixa: ['vendas', 'financeiro'],
            estoque: ['estoque', 'cardapio']
        };
        
        const userPermissions = permissions[role] || [];
        return userPermissions.includes(permission);
    }
}

// Inicializar sistema global
window.authSystem = new AuthSystem();

console.log('🔐 Sistema de autenticação carregado');