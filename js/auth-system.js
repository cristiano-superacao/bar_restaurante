// Sistema de Autenticação e Autorização - Maria Flor
// Gerencia usuários, login e permissões por função

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 8 * 60 * 60 * 1000; // 8 horas
        this.isLocalMode = window.LOCAL_MODE && window.LOCAL_MODE.enabled;
        
        if (this.isLocalMode) {
            console.log('🏠 Auth System: Modo Local Detectado');
            this.users = window.MOCK_USERS || {};
        } else {
            this.initializeUsers();
        }
        
        this.setupSessionManagement();
    }

    // Usuários pré-cadastrados no sistema (modo produção)
    initializeUsers() {
        const defaultUsers = [
            // GERENTES (Acesso Total)
            {
                id: 1,
                username: 'admin',
                password: 'MariaFlor2025!',
                name: 'Administrador do Sistema',
                role: 'admin',
                permissions: ['*'], // Todas as permissões
                email: 'admin@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'gerente',
                password: 'Gerente123!',
                name: 'Gerente Geral',
                role: 'manager',
                permissions: ['dashboard', 'sales', 'orders', 'menu', 'stock', 'financial', 'reports', 'users'],
                email: 'gerente@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            
            // GARÇONS (Mesas e Pedidos)
            {
                id: 3,
                username: 'garcom1',
                password: 'Garcom123!',
                name: 'Maria Silva - Garçonete',
                role: 'waiter',
                permissions: ['dashboard', 'orders', 'sales', 'menu-view'],
                email: 'garcom1@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                username: 'garcom2',
                password: 'Garcom123!',
                name: 'João Santos - Garçom',
                role: 'waiter',
                permissions: ['dashboard', 'orders', 'sales', 'menu-view'],
                email: 'garcom2@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            
            // COZINHA (Apenas Pedidos)
            {
                id: 5,
                username: 'cozinha1',
                password: 'Cozinha123!',
                name: 'Pedro Chef - Cozinheiro',
                role: 'kitchen',
                permissions: ['dashboard-kitchen', 'orders-kitchen', 'menu-view'],
                email: 'cozinha1@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                username: 'cozinha2',
                password: 'Cozinha123!',
                name: 'Ana Souza - Cozinheira',
                role: 'kitchen',
                permissions: ['dashboard-kitchen', 'orders-kitchen', 'menu-view'],
                email: 'cozinha2@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            
            // CAIXA (Vendas e Dashboard)
            {
                id: 7,
                username: 'caixa1',
                password: 'Caixa123!',
                name: 'Carlos Operador - Caixa',
                role: 'cashier',
                permissions: ['dashboard', 'sales', 'financial-view', 'reports-sales'],
                email: 'caixa1@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 8,
                username: 'caixa2',
                password: 'Caixa123!',
                name: 'Lucia Costa - Caixa',
                role: 'cashier',
                permissions: ['dashboard', 'sales', 'financial-view', 'reports-sales'],
                email: 'caixa2@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            
            // ESTOQUE (Produtos e Estoque)
            {
                id: 9,
                username: 'estoque1',
                password: 'Estoque123!',
                name: 'Roberto Almoxarife - Estoque',
                role: 'stock',
                permissions: ['dashboard', 'stock', 'menu', 'reports-stock'],
                email: 'estoque1@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            },
            {
                id: 10,
                username: 'estoque2',
                password: 'Estoque123!',
                name: 'Fernanda Lima - Estoque',
                role: 'stock',
                permissions: ['dashboard', 'stock', 'menu', 'reports-stock'],
                email: 'estoque2@mariaflor.com',
                active: true,
                lastLogin: null,
                createdAt: new Date().toISOString()
            }
        ];

        // Salvar usuários se não existirem
        if (!localStorage.getItem('maria_flor_users')) {
            localStorage.setItem('maria_flor_users', JSON.stringify(defaultUsers));
        }
    }

    // Configurar gerenciamento de sessão
    setupSessionManagement() {
        // Verificar sessão ativa ao carregar
        this.checkActiveSession();
        
        // Auto-logout por inatividade
        this.setupActivityMonitoring();
        
        // Limpeza ao fechar aba/browser
        window.addEventListener('beforeunload', () => {
            this.updateLastActivity();
        });
    }

    // Verificar se há sessão ativa válida
    checkActiveSession() {
        const session = localStorage.getItem('maria_flor_session');
        if (session) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                if (now - sessionData.lastActivity < this.sessionTimeout) {
                    // Sessão válida
                    this.currentUser = sessionData.user;
                    this.updateLastActivity();
                    return true;
                } else {
                    // Sessão expirada
                    this.logout();
                }
            } catch (error) {
                console.error('Erro ao verificar sessão:', error);
                this.logout();
            }
        }
        return false;
    }

    // Monitorar atividade do usuário
    setupActivityMonitoring() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.updateLastActivity();
                }
            });
        });

        // Verificar expiração a cada minuto
        setInterval(() => {
            this.checkSessionTimeout();
        }, 60000);
    }

    // Atualizar última atividade
    updateLastActivity() {
        if (this.currentUser) {
            const session = {
                user: this.currentUser,
                lastActivity: new Date().getTime(),
                loginTime: JSON.parse(localStorage.getItem('maria_flor_session') || '{}').loginTime || new Date().getTime()
            };
            localStorage.setItem('maria_flor_session', JSON.stringify(session));
        }
    }

    // Verificar timeout da sessão
    checkSessionTimeout() {
        const session = localStorage.getItem('maria_flor_session');
        if (session && this.currentUser) {
            try {
                const sessionData = JSON.parse(session);
                const now = new Date().getTime();
                
                if (now - sessionData.lastActivity >= this.sessionTimeout) {
                    this.showTimeoutWarning();
                }
            } catch (error) {
                console.error('Erro ao verificar timeout:', error);
            }
        }
    }

    // Mostrar aviso de timeout
    showTimeoutWarning() {
        const remainingTime = this.sessionTimeout - (new Date().getTime() - JSON.parse(localStorage.getItem('maria_flor_session')).lastActivity);
        
        if (remainingTime <= 300000) { // 5 minutos restantes
            if (confirm('Sua sessão expirará em breve. Deseja continuar?')) {
                this.updateLastActivity();
            } else {
                this.logout();
            }
        }
    }

    // Realizar login
    async login(username, password) {
        try {
            // Modo local - usar API local
            if (this.isLocalMode && window.LocalAPI) {
                console.log('🏠 Login: Usando API Local');
                const response = await window.LocalAPI.login(username, password);
                
                if (response.success) {
                    this.currentUser = response.user;
                    
                    // Criar sessão local
                    const session = {
                        user: this.currentUser,
                        loginTime: new Date().getTime(),
                        lastActivity: new Date().getTime(),
                        token: response.token
                    };
                    localStorage.setItem('maria_flor_session', JSON.stringify(session));
                    localStorage.setItem('maria_flor_current_user', JSON.stringify(this.currentUser));
                    localStorage.setItem('maria_flor_token', response.token);
                    
                    console.log('✅ Login realizado com sucesso (modo local):', this.currentUser);
                    return { success: true, user: this.currentUser };
                } else {
                    throw new Error(response.error || 'Credenciais inválidas');
                }
            }
            
            // Modo produção - usar localStorage
            const users = JSON.parse(localStorage.getItem('maria_flor_users') || '[]');
            const user = users.find(u => u.username === username && u.active);
            
            if (!user) {
                throw new Error('Usuário não encontrado ou inativo');
            }
            
            if (user.password !== password) {
                throw new Error('Senha incorreta');
            }
            
            // Login bem-sucedido
            this.currentUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                permissions: user.permissions,
                email: user.email
            };
            
            // Atualizar último login
            const userIndex = users.findIndex(u => u.id === user.id);
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem('maria_flor_users', JSON.stringify(users));
            
            // Criar sessão
            const session = {
                user: this.currentUser,
                loginTime: new Date().getTime(),
                lastActivity: new Date().getTime()
            };
            localStorage.setItem('maria_flor_session', JSON.stringify(session));
            localStorage.setItem('maria_flor_current_user', JSON.stringify(this.currentUser));
            
            // Log de acesso
            this.logAccess('login', username);
            
            return {
                success: true,
                user: this.currentUser,
                message: `Bem-vindo(a), ${user.name}!`,
                redirectTo: this.getRedirectPath()
            };
            
        } catch (error) {
            this.logAccess('login_failed', username, error.message);
            throw error;
        }
    }

    // Determinar redirecionamento baseado na função
    getRedirectPath() {
        if (!this.currentUser) return '/';
        
        switch (this.currentUser.role) {
            case 'admin':
            case 'manager':
                return 'pages/dashboard.html#dashboard';
            case 'waiter':
                return 'pages/dashboard.html#pedidos';
            case 'kitchen':
                return 'pages/dashboard.html#pedidos';
            case 'cashier':
                return 'pages/dashboard.html#vendas';
            case 'stock':
                return 'pages/dashboard.html#estoque';
            default:
                return 'pages/dashboard.html#dashboard';
        }
    }

    // Realizar logout
    logout() {
        if (this.currentUser) {
            this.logAccess('logout', this.currentUser.username);
        }
        
        this.currentUser = null;
        localStorage.removeItem('maria_flor_session');
        localStorage.removeItem('maria_flor_current_user');
        
        // Redirecionar para login
        if (window.location.pathname !== '/' && !window.location.pathname.includes('index.html')) {
            window.location.href = '../index.html';
        }
    }

    // Verificar permissão
    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Admin tem todas as permissões
        if (this.currentUser.permissions.includes('*')) return true;
        
        // Verificar permissão específica
        return this.currentUser.permissions.includes(permission);
    }

    // Verificar múltiplas permissões (OR)
    hasAnyPermission(permissions) {
        return permissions.some(permission => this.hasPermission(permission));
    }

    // Verificar múltiplas permissões (AND)
    hasAllPermissions(permissions) {
        return permissions.every(permission => this.hasPermission(permission));
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar se está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Verificar se pode realizar uma ação específica
    canPerform(action) {
        if (!this.currentUser) return false;
        
        // Admin pode fazer tudo
        if (this.hasPermission('*')) return true;
        
        // Mapear ações para permissões
        const actionMap = {
            'menu-edit': ['menu', 'admin', 'manager'],
            'menu-delete': ['menu', 'admin', 'manager'], 
            'menu-view': ['menu', 'menu-view', 'admin', 'manager', 'waiter', 'kitchen'],
            'sales-create': ['sales', 'admin', 'manager', 'waiter', 'cashier'],
            'sales-edit': ['sales', 'admin', 'manager', 'cashier'],
            'sales-view': ['sales', 'admin', 'manager', 'waiter', 'cashier'],
            'orders-create': ['orders', 'admin', 'manager', 'waiter'],
            'orders-edit': ['orders', 'orders-kitchen', 'admin', 'manager', 'kitchen'],
            'orders-view': ['orders', 'orders-kitchen', 'admin', 'manager', 'waiter', 'kitchen'],
            'stock-edit': ['stock', 'admin', 'manager'],
            'stock-view': ['stock', 'admin', 'manager', 'stock'],
            'financial-edit': ['financial', 'admin', 'manager'],
            'financial-view': ['financial', 'financial-view', 'admin', 'manager', 'cashier'],
            'reports-generate': ['reports', 'reports-sales', 'reports-stock', 'admin', 'manager']
        };
        
        const requiredPermissions = actionMap[action] || [action];
        return this.hasAnyPermission(requiredPermissions);
    }

    // Verificar se pode acessar um módulo
    canAccess(module) {
        if (!this.currentUser) return false;
        
        // Admin pode acessar tudo
        if (this.hasPermission('*')) return true;
        
        // Mapear módulos para permissões
        const moduleMap = {
            'dashboard': ['dashboard', 'dashboard-kitchen'],
            'vendas': ['sales'],
            'mesas': ['orders', 'sales'], // Garçons precisam acessar mesas
            'pedidos': ['orders', 'orders-kitchen'],
            'cardapio': ['menu', 'menu-view'],
            'estoque': ['stock'],
            'financeiro': ['financial', 'financial-view'],
            'relatorios': ['reports', 'reports-sales', 'reports-stock'],
            'configuracoes': ['admin']
        };
        
        const requiredPermissions = moduleMap[module] || [module];
        return this.hasAnyPermission(requiredPermissions);
    }

    // Obter permissões do usuário atual
    getUserPermissions() {
        return this.currentUser ? this.currentUser.permissions : [];
    }

    // Log de acessos
    logAccess(action, username, details = null) {
        const logs = JSON.parse(localStorage.getItem('maria_flor_access_logs') || '[]');
        
        const logEntry = {
            id: Date.now(),
            action: action,
            username: username,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            ip: 'localhost', // Em produção, capturar IP real
            details: details
        };
        
        logs.push(logEntry);
        
        // Manter apenas os últimos 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('maria_flor_access_logs', JSON.stringify(logs));
    }

    // Obter logs de acesso
    getAccessLogs(limit = 50) {
        const logs = JSON.parse(localStorage.getItem('maria_flor_access_logs') || '[]');
        return logs.slice(-limit).reverse();
    }

    // Alterar senha (usuário logado)
    changePassword(currentPassword, newPassword) {
        if (!this.currentUser) {
            throw new Error('Usuário não logado');
        }
        
        const users = JSON.parse(localStorage.getItem('maria_flor_users') || '[]');
        const userIndex = users.findIndex(u => u.id === this.currentUser.id);
        
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }
        
        if (users[userIndex].password !== currentPassword) {
            throw new Error('Senha atual incorreta');
        }
        
        if (newPassword.length < 6) {
            throw new Error('Nova senha deve ter pelo menos 6 caracteres');
        }
        
        users[userIndex].password = newPassword;
        users[userIndex].lastPasswordChange = new Date().toISOString();
        
        localStorage.setItem('maria_flor_users', JSON.stringify(users));
        this.logAccess('password_change', this.currentUser.username);
        
        return { success: true, message: 'Senha alterada com sucesso' };
    }

    // Obter informações da sessão
    getSessionInfo() {
        const session = localStorage.getItem('maria_flor_session');
        if (session && this.currentUser) {
            const sessionData = JSON.parse(session);
            const now = new Date().getTime();
            
            return {
                user: this.currentUser,
                loginTime: new Date(sessionData.loginTime),
                lastActivity: new Date(sessionData.lastActivity),
                sessionDuration: now - sessionData.loginTime,
                timeRemaining: this.sessionTimeout - (now - sessionData.lastActivity)
            };
        }
        return null;
    }

    // Definições de funções e suas descrições
    getRoleDefinitions() {
        return {
            admin: {
                name: 'Administrador',
                description: 'Acesso total ao sistema',
                color: '#e74c3c',
                icon: 'fas fa-crown'
            },
            manager: {
                name: 'Gerente',
                description: 'Acesso a todas as operações',
                color: '#9b59b6',
                icon: 'fas fa-user-tie'
            },
            waiter: {
                name: 'Garçom/Garçonete',
                description: 'Mesas e atendimento',
                color: '#3498db',
                icon: 'fas fa-concierge-bell'
            },
            kitchen: {
                name: 'Cozinha',
                description: 'Preparo de pedidos',
                color: '#e67e22',
                icon: 'fas fa-fire'
            },
            cashier: {
                name: 'Caixa',
                description: 'Vendas e financeiro',
                color: '#27ae60',
                icon: 'fas fa-cash-register'
            },
            stock: {
                name: 'Estoque',
                description: 'Produtos e inventário',
                color: '#f39c12',
                icon: 'fas fa-boxes'
            }
        };
    }
}

// Inicializar sistema de autenticação
window.authSystem = new AuthSystem();

// Verificar autenticação ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    // Se não estiver na página de login e não estiver logado, redirecionar
    if (!window.location.pathname.includes('index.html') && 
        window.location.pathname !== '/' && 
        !window.authSystem.isLoggedIn()) {
        window.location.href = window.location.pathname.includes('pages/') ? '../index.html' : 'index.html';
    }
});

// Exportar para uso global
window.AuthSystem = AuthSystem;