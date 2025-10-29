/**
 * Configurações Centrais do Sistema
 * Bar Restaurante Maria Flor
 */

const CONFIG = {
    // Informações do Sistema
    APP: {
        name: 'Maria Flor',
        version: '2.1.0',
        description: 'Sistema de Gestão para Bar e Restaurante',
        author: 'Cristiano Santos',
        location: 'Salvador, BA - Bairro do Resgate'
    },

    // URLs e Endpoints
    URLS: {
        local: 'http://localhost:8000',
        production: 'https://barestaurente.netlify.app',
        github: 'https://github.com/cristiano-superacao/bar_restaurante'
    },

    // Credenciais de Teste
    USERS: {
        admin: {
            username: 'admin',
            email: 'admin@mariaflor.com.br',
            password: 'admin123',
            name: 'Administrador',
            role: 'admin',
            permissions: ['all']
        },
        gerente: {
            username: 'gerente',
            email: 'gerente@mariaflor.com.br',
            password: 'gerente123',
            name: 'Maria Santos',
            role: 'gerente',
            permissions: ['vendas', 'pedidos', 'cardapio', 'estoque', 'financeiro']
        },
        garcom: {
            username: 'garcom',
            email: 'garcom@mariaflor.com.br',
            password: 'garcom123',
            name: 'João Silva',
            role: 'garcom',
            permissions: ['vendas', 'pedidos', 'mesas']
        },
        cozinha: {
            username: 'cozinha',
            email: 'cozinha@mariaflor.com.br',
            password: 'cozinha123',
            name: 'Ana Costa',
            role: 'cozinha',
            permissions: ['pedidos', 'cardapio']
        },
        caixa: {
            username: 'caixa',
            email: 'caixa@mariaflor.com.br',
            password: 'caixa123',
            name: 'Carlos Oliveira',
            role: 'caixa',
            permissions: ['vendas', 'financeiro']
        }
    },

    // Dados Mock para Dashboard
    MOCK_DATA: {
        vendas: {
            hoje: 2500.00,
            ontem: 2100.00,
            semana: 15750.00,
            mes: 67500.00,
            crescimento: 12.5
        },
        pedidos: {
            pendentes: 8,
            preparando: 12,
            prontos: 3,
            entregues: 47,
            cancelados: 2
        },
        mesas: {
            ocupadas: 15,
            livres: 5,
            total: 20,
            rotatividade: 3.2
        },
        produtos: {
            total: 156,
            baixoEstoque: 12,
            ativos: 144,
            inativos: 12
        },
        funcionarios: {
            total: 8,
            ativos: 6,
            folga: 2
        }
    },

    // Configurações de Interface
    UI: {
        theme: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#28a745',
            danger: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        },
        sidebar: {
            collapsed: false,
            width: '250px',
            collapsedWidth: '70px'
        },
        animations: {
            duration: 300,
            easing: 'ease-in-out'
        }
    },

    // Configurações de Desenvolvimento
    DEV: {
        debug: true,
        mockData: true,
        logs: true,
        apiDelay: 500
    },

    // Utilitários
    UTILS: {
        // Formatar moeda
        formatCurrency: (value) => {
            return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }).format(value);
        },

        // Formatar data
        formatDate: (date) => {
            return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
        },

        // Gerar ID único
        generateId: () => {
            return Math.random().toString(36).substr(2, 9);
        },

        // Validar email
        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    }
};

// Exportar configurações globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

console.log('⚙️ Configurações do sistema carregadas:', CONFIG.APP.name, 'v' + CONFIG.APP.version);