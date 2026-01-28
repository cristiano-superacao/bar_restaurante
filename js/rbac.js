/**
 * Sistema de Controle de Acesso Baseado em Roles (RBAC)
 * Bar Restaurante - Sistema de Gestão
 * 
 * Roles:
 * - superadmin: Acesso total (todas as empresas)
 * - admin: Gerencia apenas sua empresa
 * - staff: Operações básicas (garçom, cozinha, caixa)
 */

class RBACSystem {
    constructor() {
        this.roles = {
            superadmin: {
                name: 'Super Administrador',
                level: 3,
                permissions: ['all'],
                description: 'Acesso total ao sistema (todas as empresas)'
            },
            admin: {
                name: 'Administrador',
                level: 2,
                permissions: [
                    'dashboard.view',
                    'pedidos.manage',
                    'mesas.manage',
                    'cardapio.manage',
                    'delivery.manage',
                    'clientes.manage',
                    'reservas.manage',
                    'estoque.manage',
                    'financeiro.manage',
                    'relatorios.view',
                    'usuarios.manage',
                    'configuracoes.manage'
                ],
                description: 'Gerencia apenas sua própria empresa'
            },
            staff: {
                name: 'Funcionário',
                level: 1,
                permissions: [
                    'dashboard.view',
                    'pedidos.view',
                    'pedidos.create',
                    'mesas.view',
                    'cardapio.view',
                    'delivery.view'
                ],
                description: 'Operações básicas (vendas e atendimento)'
            }
        };

        // Páginas restritas apenas para superadmin
        this.superadminOnlyPages = [
            'empresas.html'
        ];

        // Páginas bloqueadas para staff
        this.staffBlockedPages = [
            'usuarios.html',
            'empresas.html',
            'configuracoes.html',
            'financeiro.html',
            'estoque.html'
        ];
    }

    /**
     * Obtém o usuário atual do localStorage
     */
    getCurrentUser() {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (!userStr) return null;
            return JSON.parse(userStr);
        } catch (error) {
            console.error('❌ Erro ao obter usuário:', error);
            return null;
        }
    }

    /**
     * Obtém o role do usuário atual
     */
    getCurrentRole() {
        const user = this.getCurrentUser();
        return user?.role || 'staff';
    }

    /**
     * Verifica se o usuário tem um role específico
     */
    hasRole(requiredRole) {
        const currentRole = this.getCurrentRole();
        const currentLevel = this.roles[currentRole]?.level || 0;
        const requiredLevel = this.roles[requiredRole]?.level || 0;
        return currentLevel >= requiredLevel;
    }

    /**
     * Verifica se o usuário é superadmin
     */
    isSuperAdmin() {
        return this.getCurrentRole() === 'superadmin';
    }

    /**
     * Verifica se o usuário é admin ou superior
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * Verifica se o usuário tem uma permissão específica
     */
    hasPermission(permission) {
        const currentRole = this.getCurrentRole();
        const roleConfig = this.roles[currentRole];
        
        if (!roleConfig) return false;
        
        // Superadmin tem todas as permissões
        if (roleConfig.permissions.includes('all')) return true;
        
        // Verifica se tem a permissão específica
        return roleConfig.permissions.includes(permission);
    }

    /**
     * Verifica se o usuário pode acessar uma página
     */
    canAccessPage(pageName) {
        const currentRole = this.getCurrentRole();
        
        // Páginas restritas apenas para superadmin
        if (this.superadminOnlyPages.includes(pageName)) {
            return this.isSuperAdmin();
        }
        
        // Páginas bloqueadas para staff
        if (this.staffBlockedPages.includes(pageName) && currentRole === 'staff') {
            return false;
        }
        
        return true;
    }

    /**
     * Redireciona se não tiver acesso à página atual
     */
    checkPageAccess() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Não verificar na página de login
        if (currentPage === 'index.html' || currentPage === '') return;
        
        if (!this.canAccessPage(currentPage)) {
            console.warn('⚠️ Acesso negado à página:', currentPage);
            this.showAccessDeniedMessage();
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        }
    }

    /**
     * Mostra mensagem de acesso negado
     */
    showAccessDeniedMessage() {
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc2626;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
        `;
        
        message.innerHTML = `
            <i class="fas fa-ban"></i>
            <span>Acesso negado! Você não tem permissão para esta página.</span>
        `;
        
        document.body.appendChild(message);
        
        // Remover após 3 segundos
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }

    /**
     * Oculta elementos da interface baseado em permissões
     */
    applyUIRestrictions() {
        const currentRole = this.getCurrentRole();
        
        // Ocultar link de Empresas para não-superadmins
        if (!this.isSuperAdmin()) {
            const empresasLink = document.querySelector('a[href="empresas.html"]');
            if (empresasLink) {
                const li = empresasLink.closest('li');
                if (li) li.style.display = 'none';
            }
        }
        
        // Ocultar links bloqueados para staff
        if (currentRole === 'staff') {
            this.staffBlockedPages.forEach(page => {
                const link = document.querySelector(`a[href="${page}"]`);
                if (link) {
                    const li = link.closest('li');
                    if (li) li.style.display = 'none';
                }
            });
        }
        
        // Adicionar badge de role no header
        this.addRoleBadge();
    }

    /**
     * Adiciona badge visual mostrando o role do usuário
     */
    addRoleBadge() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const roleConfig = this.roles[user.role];
        if (!roleConfig) return;
        
        // Procurar por um elemento de usuário no header
        const userInfo = document.querySelector('.user-info, .header-user, .current-user');
        if (!userInfo) return;
        
        const badge = document.createElement('span');
        badge.className = 'role-badge';
        
        const colors = {
            superadmin: '#8b5cf6',
            admin: '#3b82f6',
            staff: '#64748b'
        };
        
        badge.style.cssText = `
            background: ${colors[user.role] || colors.staff};
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-left: 8px;
        `;
        
        badge.textContent = roleConfig.name;
        userInfo.appendChild(badge);
    }

    /**
     * Filtra dados para mostrar apenas da empresa do usuário (admin)
     * Superadmin vê todos os dados
     */
    filterByCompany(data, companyIdField = 'company_id') {
        if (this.isSuperAdmin()) {
            // Superadmin vê todos os dados
            return data;
        }
        
        const user = this.getCurrentUser();
        const userCompanyId = user?.company_id;
        
        if (!userCompanyId) {
            console.warn('⚠️ Usuário sem company_id definido');
            return data;
        }
        
        // Filtrar apenas dados da empresa do usuário
        if (Array.isArray(data)) {
            return data.filter(item => item[companyIdField] === userCompanyId);
        }
        
        return data;
    }

    /**
     * Adiciona company_id automaticamente em requisições (admin)
     * Superadmin não adiciona filtro
     */
    addCompanyFilter(params = {}) {
        if (this.isSuperAdmin()) {
            // Superadmin não precisa de filtro
            return params;
        }
        
        const user = this.getCurrentUser();
        const userCompanyId = user?.company_id;
        
        if (userCompanyId) {
            return {
                ...params,
                company_id: userCompanyId
            };
        }
        
        return params;
    }

    /**
     * Mostra informações de debug do RBAC
     */
    debugInfo() {
        const shouldLog = () => {
            try {
                return typeof CONFIG !== 'undefined' && CONFIG.DEV && CONFIG.DEV.logs;
            } catch {
                return false;
            }
        };

        if (!shouldLog()) return;

        const user = this.getCurrentUser();
        console.group('🔐 RBAC Debug Info');
        console.log('Usuário:', user?.name || 'Não autenticado');
        console.log('Role:', this.getCurrentRole());
        console.log('É Superadmin?', this.isSuperAdmin());
        console.log('É Admin?', this.isAdmin());
        console.log('Company ID:', user?.company_id || 'N/A');
        console.log('Permissões:', this.roles[this.getCurrentRole()]?.permissions || []);
        console.groupEnd();
    }
}

// Criar instância global
const RBAC = new RBACSystem();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Verificar acesso à página
    RBAC.checkPageAccess();
    
    // Aplicar restrições na UI
    RBAC.applyUIRestrictions();
    
    // Debug (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost') {
        RBAC.debugInfo();
    }
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RBACSystem;
}
