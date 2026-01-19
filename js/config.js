/**
 * Configurações Centrais do Sistema
 * Bar Restaurante Maria Flor
 */

// Detecta automaticamente a URL da API conforme o ambiente
function detectApiBaseUrl() {
    const DEFAULT_RAILWAY = 'https://barestaurante.up.railway.app';
    try {
        if (typeof window === 'undefined') return DEFAULT_RAILWAY;
        const { protocol, hostname } = window.location || {};

        // Permite forçar a API via querystring (útil para testes locais sem backend)
        // Ex.: http://localhost:8000/dashboard.html?api=railway
        try {
            const params = new URLSearchParams(window.location.search || '');
            const api = (params.get('api') || '').toLowerCase();
            if (api === 'railway') return DEFAULT_RAILWAY;
        } catch {
            // ignora
        }

        // Ambiente de desenvolvimento: frontend em 8000, backend em 3000
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return `${protocol || 'http:'}//localhost:3000`;
        }

        // Permite override manual via variável global (útil em testes)
        if (window.__API_BASE_URL__ && typeof window.__API_BASE_URL__ === 'string') {
            return window.__API_BASE_URL__;
        }

        // Produção: Railway
        return DEFAULT_RAILWAY;
    } catch {
        return DEFAULT_RAILWAY;
    }
}

const CONFIG = {
    // Informações do Sistema
    APP: {
        name: 'Maria Flor',
        version: '2.2.0',
        description: 'Sistema de Gestão para Bar e Restaurante',
        author: 'Cristiano Santos',
        location: 'Salvador, BA - Bairro do Resgate'
    },

    // URLs e Endpoints
    URLS: {
        local: 'http://localhost:8000',
        production: 'https://barestaurante.netlify.app',
        github: 'https://github.com/cristiano-superacao/bar_restaurante'
    },

    // API (opcional). Quando enabled=false, usa apenas LocalStorage
    API: {
        enabled: true, // API habilitada por padrão (Railway)
        baseUrl: detectApiBaseUrl(), // Detecta automaticamente (local x Railway)
        timeoutMs: 8000
    },

    // Credenciais de Teste
    USERS: {
        superadmin: {
            username: 'superadmin',
            email: 'superadmin@sistema.com.br',
            password: 'super123',
            name: 'Super Administrador',
            role: 'superadmin',
            company_id: null, // Acesso a todas as empresas
            permissions: ['all']
        },
        admin: {
            username: 'admin',
            email: 'admin@mariaflor.com.br',
            password: 'admin123',
            name: 'Administrador Maria Flor',
            role: 'admin',
            company_id: 1, // Empresa Maria Flor
            permissions: ['dashboard.view', 'pedidos.manage', 'mesas.manage', 'cardapio.manage', 
                         'delivery.manage', 'clientes.manage', 'reservas.manage', 'estoque.manage',
                         'financeiro.manage', 'relatorios.view', 'usuarios.manage', 'configuracoes.manage']
        },
        admin2: {
            username: 'admin2',
            email: 'admin@outrorestaurante.com.br',
            password: 'admin123',
            name: 'Administrador Outro Restaurante',
            role: 'admin',
            company_id: 2, // Outra empresa
            permissions: ['dashboard.view', 'pedidos.manage', 'mesas.manage', 'cardapio.manage', 
                         'delivery.manage', 'clientes.manage', 'reservas.manage', 'estoque.manage',
                         'financeiro.manage', 'relatorios.view', 'usuarios.manage', 'configuracoes.manage']
        },
        garcom: {
            username: 'garcom',
            email: 'garcom@mariaflor.com.br',
            password: 'garcom123',
            name: 'João Silva',
            role: 'staff',
            company_id: 1,
            permissions: ['dashboard.view', 'pedidos.view', 'pedidos.create', 'mesas.view', 'cardapio.view', 'delivery.view']
        },
        cozinha: {
            username: 'cozinha',
            email: 'cozinha@mariaflor.com.br',
            password: 'cozinha123',
            name: 'Ana Costa',
            role: 'staff',
            company_id: 1,
            permissions: ['dashboard.view', 'pedidos.view', 'cardapio.view']
        },
        caixa: {
            username: 'caixa',
            email: 'caixa@mariaflor.com.br',
            password: 'caixa123',
            name: 'Carlos Oliveira',
            role: 'staff',
            company_id: 1,
            permissions: ['dashboard.view', 'pedidos.view', 'financeiro.view']
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
        // Formatadores (moeda/data) são fornecidos por js/utils.js e mesclados em CONFIG.UTILS

        // Gerar ID único
        generateId: () => {
            return Math.random().toString(36).substr(2, 9);
        },

        // Validar email
        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
    },

    // Variáveis de negócio
    CONSTS: {
        ORDER_TYPES: ['Mesa', 'Delivery'],
        ORDER_STATUS_MESA: ['Pendente', 'Em Preparo', 'Entregue', 'Pago', 'Cancelado'],
        ORDER_STATUS_DELIVERY: ['Pendente', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Pago', 'Cancelado'],
        PAYMENT_METHODS: ['Dinheiro', 'Cartão', 'PIX']
    }
};

// Override de API via LocalStorage (útil em produção sem rebuild)
// Chave: apiConfigOverride = { enabled?: boolean, baseUrl?: string, timeoutMs?: number }
try {
    if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem('apiConfigOverride');
        if (raw) {
            const ov = JSON.parse(raw);
            if (ov && typeof ov === 'object') {
                if (typeof ov.enabled === 'boolean') CONFIG.API.enabled = ov.enabled;
                if (typeof ov.baseUrl === 'string' && ov.baseUrl.trim()) CONFIG.API.baseUrl = ov.baseUrl.trim().replace(/\/$/, '');
                if (typeof ov.timeoutMs === 'number' && Number.isFinite(ov.timeoutMs) && ov.timeoutMs >= 1000) CONFIG.API.timeoutMs = ov.timeoutMs;
            }
        }
    }
} catch {
    // Ignorar override inválido
}

// Exportar configurações globalmente
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

console.log('⚙️ Configurações do sistema carregadas:', CONFIG.APP.name, 'v' + CONFIG.APP.version);
