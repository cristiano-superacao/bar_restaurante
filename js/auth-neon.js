/**
 * Sistema de Autenticação Simplificado - Cliente Estático
 * Sistema Bar Restaurante Maria Flor
 */

class AuthSystemNeon {
    constructor() {
        this.currentUser = null;
        this.token = null;
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

    // Fazer login - Sistema estático com credenciais fixas
    async login(username, senha) {
        try {
            console.log('🔄 Tentando login:', username);

            // Usar credenciais do arquivo de configuração
            const validUsers = {};

            // Criar mapa de usuários a partir da configuração
            if (typeof CONFIG !== 'undefined' && CONFIG.USERS) {
                Object.values(CONFIG.USERS).forEach(userConfig => {
                    // Por username
                    validUsers[userConfig.username] = {
                        senha: userConfig.password,
                        user: {
                            id: Object.keys(CONFIG.USERS).indexOf(userConfig.username) + 1,
                            nome: userConfig.name,
                            email: userConfig.email,
                            username: userConfig.username,
                            role: userConfig.role,
                            permissions: userConfig.permissions || []
                        }
                    };

                    // Por email
                    validUsers[userConfig.email] = {
                        senha: userConfig.password,
                        user: {
                            id: Object.keys(CONFIG.USERS).indexOf(userConfig.username) + 1,
                            nome: userConfig.name,
                            email: userConfig.email,
                            username: userConfig.username,
                            role: userConfig.role,
                            permissions: userConfig.permissions || []
                        }
                    };
                });
            } else {
                // Fallback para credenciais hardcoded se CONFIG não estiver disponível
                console.warn('⚠️ CONFIG não encontrado, usando credenciais padrão');
                validUsers['admin'] = {
                    senha: 'admin123',
                    user: { id: 1, nome: 'Administrador', email: 'admin@mariaflor.com.br', username: 'admin', role: 'admin' }
                };
            }

            // Verificar credenciais
            if (validUsers[username] && validUsers[username].senha === senha) {
                this.currentUser = validUsers[username].user;
                this.token = 'static-auth-token'; // Token simples para demo

                // Salvar no localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

                console.log('✅ Login realizado:', this.currentUser.nome);
                console.log('👤 Usuário logado:', this.currentUser);
                return { success: true, user: this.currentUser };
            } else {
                console.error('❌ Credenciais inválidas para:', username);
                return { success: false, message: 'Usuário ou senha incorretos' };
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);
            return {
                success: false,
                message: 'Erro interno do sistema'
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

    // Obter dados do dashboard - Dados mockados para sistema estático
    async getDashboardData() {
        // Usar dados do arquivo de configuração se disponível
        if (typeof CONFIG !== 'undefined' && CONFIG.MOCK_DATA) {
            return CONFIG.MOCK_DATA;
        }

        // Fallback para dados hardcoded
        return {
            vendas: { hoje: 2500.00, ontem: 2100.00, semana: 15750.00, mes: 67500.00 },
            pedidos: { pendentes: 8, preparando: 12, prontos: 3, entregues: 47 },
            mesas: { ocupadas: 15, livres: 5, total: 20 },
            produtos: { total: 156, baixoEstoque: 12, ativos: 144 }
        };
    }

    // Testar conexão - Simulado para sistema estático
    async testConnection() {
        console.log('✅ Sistema estático funcionando');
        return true;
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

    // Compatibilidade com telas novas (IDs fixos no sidebar)
    try {
        const usernameDisplay = document.getElementById('username-display');
        const userRoleDisplay = document.getElementById('user-role-display');

        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('userRole');
        const companyName = localStorage.getItem('activeCompanyName');
        const apiEnabled = !!(typeof window !== 'undefined' && window.CONFIG && window.CONFIG.API && window.CONFIG.API.enabled);

        const displayName = storedUsername || (auth.isAuthenticated() ? (auth.getCurrentUser()?.nome || auth.getCurrentUser()?.username || '') : '') || 'Usuário';
        const role = storedRole || (auth.isAuthenticated() ? (auth.getCurrentUser()?.role || '') : '') || '';

        if (usernameDisplay) usernameDisplay.textContent = displayName;

        if (userRoleDisplay) {
            if (role === 'superadmin') {
                userRoleDisplay.textContent = companyName
                    ? `superadmin • ${companyName}`
                    : (apiEnabled ? 'superadmin • selecione empresa' : 'superadmin');
            } else if (role) {
                userRoleDisplay.textContent = role;
            } else {
                // fallback para o role do auth estático
                const u = auth.isAuthenticated() ? auth.getCurrentUser() : null;
                userRoleDisplay.textContent = u && u.role ? String(u.role) : '—';
            }
        }
    } catch {
        // noop
    }

    // Mostrar/ocultar menu "Empresas" conforme role (evita confusão)
    try {
        const role = localStorage.getItem('userRole') || (auth.isAuthenticated() ? (auth.getCurrentUser()?.role || '') : '');
        const li = document.querySelector('.sidebar-nav a[href="empresas.html"]')?.closest('li');
        if (li) li.style.display = (role === 'superadmin') ? '' : 'none';
    } catch {
        // noop
    }
}

function renderCompanyBadge() {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const userRole = localStorage.getItem('userRole') || '';
        const activeCompanyId = localStorage.getItem('activeCompanyId') || '';
        const activeCompanyName = localStorage.getItem('activeCompanyName') || '';
        const hasApi = !!(typeof window !== 'undefined' && window.CONFIG && window.CONFIG.API && window.CONFIG.API.enabled);

        const headerActions = document.querySelector('.main-header .header-actions');
        if (!headerActions) return;

        // Evita duplicar
        const existing = headerActions.querySelector('.company-pill');
        if (existing) existing.remove();

        // Só mostra quando há contexto de empresa OU quando for superadmin (para guiar seleção)
        const shouldShow = !!activeCompanyName || userRole === 'superadmin';
        if (!shouldShow) return;

        const pill = document.createElement('a');
        pill.className = 'company-pill';
        pill.href = (userRole === 'superadmin' && hasApi) ? 'empresas.html' : '#';
        pill.setAttribute('role', 'button');
        pill.setAttribute('aria-label', 'Empresa ativa');

        const isMissing = userRole === 'superadmin' && hasApi && !activeCompanyId;
        if (isMissing) pill.classList.add('is-warning');

        const label = (userRole === 'superadmin' && hasApi)
            ? 'Empresa'
            : 'Empresa';

        const name = isMissing
            ? 'Selecione'
            : (activeCompanyName || '—');

        pill.innerHTML = `
            <i class="fas fa-building"></i>
            <span class="label">${label}:</span>
            <span class="name" title="${String(activeCompanyName || name)}">${name}</span>
        `.trim();

        // Se não for superadmin (ou API desligada), não navega ao clicar
        if (!(userRole === 'superadmin' && hasApi)) {
            pill.addEventListener('click', (e) => e.preventDefault());
        }

        // Se houver toolbar, colocar o badge dentro dela (melhor layout)
        const toolbar = headerActions.querySelector('.toolbar');
        if (toolbar) {
            toolbar.appendChild(pill);
        } else {
            headerActions.appendChild(pill);
        }
    } catch {
        // noop
    }
}

function ensureCompanySwitchShortcut() {
    try {
        const role = localStorage.getItem('userRole') || '';
        const apiEnabled = !!(typeof window !== 'undefined' && window.CONFIG && window.CONFIG.API && window.CONFIG.API.enabled);
        if (!(role === 'superadmin' && apiEnabled)) return;

        const footer = document.querySelector('.sidebar-footer');
        if (!footer) return;

        // Evita duplicar
        if (footer.querySelector('#company-switch-btn')) return;

        const btn = document.createElement('a');
        btn.href = 'empresas.html?from=switch';
        btn.id = 'company-switch-btn';
        btn.className = 'logout-btn company-switch-btn';
        btn.title = 'Trocar empresa';
        btn.setAttribute('aria-label', 'Trocar empresa');
        btn.innerHTML = '<i class="fas fa-building"></i>';

        footer.appendChild(btn);
    } catch {
        // noop
    }
}

try {
    if (typeof window !== 'undefined') window.renderCompanyBadge = renderCompanyBadge;
} catch {}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    updateUserInterface();

    // Guardar última página (para superadmin voltar após trocar empresa)
    try {
        const token = localStorage.getItem('authToken');
        if (token) {
            const path = String(window.location.pathname || '');
            const page = path.split('/').pop() || '';
            const isLogin = page === '' || page === 'index.html';
            const isCompanies = page === 'empresas.html';
            if (!isLogin && !isCompanies) {
                localStorage.setItem('lastNonCompaniesPage', page);
            }
        }
    } catch {
        // noop
    }

    // Badge de empresa ativa (multi-tenant)
    renderCompanyBadge();
    ensureCompanySwitchShortcut();

    // Logout global: vincula o botão padrão em todas as páginas
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            auth.logout();
        });
    }

    // Testar sistema (só no dashboard)
    if (window.location.pathname.includes('dashboard.html')) {
        auth.testConnection();
    }
});

console.log('🔐 Sistema de autenticação estático carregado');
