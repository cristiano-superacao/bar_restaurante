/**
 * Sistema de Autenticação - Neon + Netlify
 * Sistema Bar Restaurante Maria Flor
 */

class AuthSystemNeon {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.apiUrl = '/.netlify/functions/server';
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
                console.log('✅ Sessão restaurada:', this.currentUser.nome);
            } catch (error) {
                console.warn('⚠️ Erro ao restaurar sessão:', error);
                this.logout();
            }
        }
    }

    // Fazer login
    async login(email, senha) {
        try {
            console.log('🔄 Tentando login:', email);
            console.log('🔗 URL da API:', `${this.apiUrl}/auth/login`);
            
            const response = await fetch(`${this.apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, senha })
            });

            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            console.log('📄 Response data:', data);

            if (data.success) {
                this.currentUser = data.user;
                this.token = 'user-logged-in'; // Token simples para demo
                
                // Salvar no localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                
                console.log('✅ Login realizado:', this.currentUser.nome);
                console.log('👤 Usuário logado:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.error('❌ Erro no login:', data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            return { 
                success: false, 
                message: 'Erro de conexão com o servidor' 
            };
        }
    }

    // Fazer logout
    logout() {
        this.currentUser = null;
        this.token = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        
        console.log('✅ Logout realizado');
        
        // Redirecionar para login se não estiver na página de login
        if (!window.location.pathname.includes('index.html') && 
            window.location.pathname !== '/') {
            window.location.href = '/index.html';
        }
    }

    // Verificar se está logado
    isAuthenticated() {
        return this.token !== null && this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar permissão por role
    hasRole(role) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.role === 'administrador' || this.currentUser.role === 'admin') return true; // Admin tem acesso a tudo
        
        return this.currentUser.role === role;
    }

    // Verificar se é admin
    isAdmin() {
        return this.hasRole('administrador') || this.hasRole('admin');
    }

    // Verificar se é gerente
    isGerente() {
        return this.hasRole('gerente') || this.isAdmin();
    }

    // Obter dados do dashboard
    async getDashboardData() {
        try {
            const response = await fetch(`${this.apiUrl}/dashboard`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();

            if (data.success) {
                return data.data;
            } else {
                console.error('❌ Erro ao obter dados:', data.message);
                return null;
            }
        } catch (error) {
            console.error('❌ Erro na requisição:', error);
            return null;
        }
    }

    // Testar conexão com API
    async testConnection() {
        try {
            const response = await fetch(`${this.apiUrl}/test`);
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Conexão com API OK:', data.timestamp);
                return true;
            } else {
                console.error('❌ Erro na conexão:', data.message);
                return false;
            }
        } catch (error) {
            console.error('❌ Erro ao testar conexão:', error);
            return false;
        }
    }
}

// Instância global do sistema de autenticação
const auth = new AuthSystemNeon();

// Middleware para proteger páginas
function requireAuth() {
    if (!auth.isAuthenticated()) {
        console.warn('⚠️ Acesso negado - usuário não autenticado');
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Middleware para proteger rotas de admin
function requireAdmin() {
    if (!auth.isAuthenticated() || !auth.isAdmin()) {
        console.warn('⚠️ Acesso negado - permissão de admin necessária');
        alert('Acesso negado. Você precisa ser administrador.');
        return false;
    }
    return true;
}

// Middleware para proteger rotas de gerente
function requireGerente() {
    if (!auth.isAuthenticated() || !auth.isGerente()) {
        console.warn('⚠️ Acesso negado - permissão de gerente necessária');
        alert('Acesso negado. Você precisa ser gerente ou administrador.');
        return false;
    }
    return true;
}

// Função para atualizar UI baseada no usuário
function updateUserInterface() {
    if (auth.isAuthenticated()) {
        const user = auth.getCurrentUser();
        
        // Atualizar nome do usuário na interface
        const userNameElements = document.querySelectorAll('[data-user-name]');
        userNameElements.forEach(element => {
            element.textContent = user.nome;
        });

        // Atualizar role do usuário
        const userRoleElements = document.querySelectorAll('[data-user-role]');
        userRoleElements.forEach(element => {
            element.textContent = user.role === 'admin' ? 'Administrador' : 
                                  user.role === 'gerente' ? 'Gerente' : 'Funcionário';
        });

        // Mostrar/esconder elementos baseado na role
        const adminElements = document.querySelectorAll('[data-admin-only]');
        adminElements.forEach(element => {
            element.style.display = auth.isAdmin() ? 'block' : 'none';
        });

        const gerenteElements = document.querySelectorAll('[data-gerente-only]');
        gerenteElements.forEach(element => {
            element.style.display = auth.isGerente() ? 'block' : 'none';
        });
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    updateUserInterface();
    
    // Testar conexão com API (só no dashboard)
    if (window.location.pathname.includes('dashboard.html')) {
        auth.testConnection();
    }
});

console.log('🔐 Sistema de autenticação Neon carregado');