/**
 * Servidor Simulado Local - Maria Flor
 * Funciona sem necessidade de Python ou Node.js
 * Para desenvolvimento e testes locais
 */

class LocalServer {
    constructor() {
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123', // Em produção seria hash
                nome: 'Administrador',
                email: 'admin@mariaflor.com',
                role: 'admin',
                ativo: true
            },
            {
                id: 2,
                username: 'gerente',
                password: 'gerente123',
                nome: 'Maria Santos',
                email: 'gerente@mariaflor.com',
                role: 'gerente',
                ativo: true
            },
            {
                id: 3,
                username: 'garcom',
                password: 'garcom123',
                nome: 'João Silva',
                email: 'garcom@mariaflor.com',
                role: 'garcom',
                ativo: true
            },
            {
                id: 4,
                username: 'cozinha',
                password: 'cozinha123',
                nome: 'Ana Costa',
                email: 'cozinha@mariaflor.com',
                role: 'cozinha',
                ativo: true
            },
            {
                id: 5,
                username: 'caixa',
                password: 'caixa123',
                nome: 'Pedro Oliveira',
                email: 'caixa@mariaflor.com',
                role: 'caixa',
                ativo: true
            }
        ];

        this.sessionToken = null;
        this.init();
    }

    init() {
        console.log('🖥️ Servidor Local Simulado iniciado');
        console.log('👥 Usuários disponíveis:');
        this.users.forEach(user => {
            console.log(`   ${user.username} / ${user.password} (${user.role})`);
        });
    }

    // Simular login
    login(username, password) {
        console.log(`🔐 Tentativa de login: ${username}`);
        
        const user = this.users.find(u => 
            u.username === username && 
            u.password === password && 
            u.ativo
        );

        if (user) {
            this.sessionToken = this.generateToken();
            const userSafe = {
                id: user.id,
                username: user.username,
                nome: user.nome,
                email: user.email,
                role: user.role
            };

            console.log('✅ Login bem-sucedido:', userSafe);
            
            return {
                success: true,
                message: `Bem-vindo, ${user.nome}!`,
                token: this.sessionToken,
                user: userSafe,
                redirectTo: this.getRedirectUrl(user.role)
            };
        } else {
            console.log('❌ Login falhou');
            return {
                success: false,
                error: 'Usuário ou senha inválidos'
            };
        }
    }

    // Gerar token simples
    generateToken() {
        return 'local_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Definir URL de redirecionamento baseada no role
    getRedirectUrl(role) {
        const redirects = {
            'admin': 'pages/dashboard.html',
            'gerente': 'pages/dashboard.html',
            'garcom': 'pages/dashboard.html',
            'cozinha': 'pages/dashboard.html',
            'caixa': 'pages/dashboard.html'
        };
        return redirects[role] || 'pages/dashboard.html';
    }

    // Verificar se está logado
    isAuthenticated() {
        return this.sessionToken !== null;
    }

    // Fazer logout
    logout() {
        this.sessionToken = null;
        console.log('🚪 Logout realizado');
    }

    // Dados do dashboard (simulado)
    getDashboardData() {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Não autenticado' };
        }

        return {
            success: true,
            data: {
                vendas_hoje: {
                    total: 2450.80,
                    quantidade: 23
                },
                pedidos_ativos: 8,
                mesas_ocupadas: 12,
                estoque_baixo: 5,
                vendas_semana: [
                    { dia: 'Seg', valor: 1200 },
                    { dia: 'Ter', valor: 1500 },
                    { dia: 'Qua', valor: 1800 },
                    { dia: 'Qui', valor: 2100 },
                    { dia: 'Sex', valor: 2450 },
                    { dia: 'Sab', valor: 3200 },
                    { dia: 'Dom', valor: 2800 }
                ]
            }
        };
    }
}

// Criar instância global do servidor simulado
window.localServer = new LocalServer();

// Override do fetch para interceptar chamadas da API
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    // Verificar se é uma chamada para API local
    if (url.includes('/api/auth/login')) {
        return new Promise((resolve) => {
            setTimeout(() => { // Simular delay de rede
                try {
                    const body = JSON.parse(options.body);
                    const result = window.localServer.login(body.username, body.password);
                    
                    resolve({
                        ok: result.success,
                        json: () => Promise.resolve(result)
                    });
                } catch (error) {
                    resolve({
                        ok: false,
                        json: () => Promise.resolve({
                            success: false,
                            error: 'Erro no servidor'
                        })
                    });
                }
            }, 500); // 500ms de delay para simular rede
        });
    }

    // Para outras URLs, usar fetch normal
    return originalFetch(url, options);
};

console.log('🔧 Servidor simulado configurado (sem Python)');