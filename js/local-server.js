/**
 * API Local Simplificada para Sistema Maria Flor
 * Funciona com servidor Python local
 */

// Configuração da API local
window.LOCAL_MODE = true;
window.API_BASE_URL = '/api';

console.log('🚀 Sistema Maria Flor - Modo Local Ativado');
console.log('🔑 Credenciais disponíveis:');
console.log('   admin / MariaFlor2025!');
console.log('   gerente / Gerente123!');
console.log('   garcom1 / Garcom123!');

// Banner de modo local
function showLocalBanner() {
    // Remover banner existente
    const existingBanner = document.getElementById('local-banner');
    if (existingBanner) {
        existingBanner.remove();
    }
    
    const banner = document.createElement('div');
    banner.id = 'local-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px 16px;
        text-align: center;
        font-size: 13px;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    banner.innerHTML = `
        🧪 MODO LOCAL ATIVO - Servidor Python (Dados Simulados)
        <button onclick="this.parentElement.style.display='none'" 
                style="margin-left: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 2px 8px; border-radius: 3px; cursor: pointer;">
            ✕
        </button>
    `;
    
    document.body.appendChild(banner);
    document.body.style.paddingTop = '40px';
}

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    showLocalBanner();
    console.log('✅ Sistema Maria Flor carregado em modo local');
});

// Dados simulados para teste local
const localData = {
    // Usuários de teste (senhas já "verificadas")
    users: [
        { id: 1, username: 'admin', role: 'admin', full_name: 'Administrador', email: 'admin@mariaflor.com' },
        { id: 2, username: 'gerente', role: 'gerente', full_name: 'Gerente Geral', email: 'gerente@mariaflor.com' },
        { id: 3, username: 'garcom1', role: 'garcom', full_name: 'Ana Silva - Garçonete', email: 'garcom1@mariaflor.com' },
        { id: 4, username: 'garcom2', role: 'garcom', full_name: 'João Santos - Garçom', email: 'garcom2@mariaflor.com' },
        { id: 5, username: 'cozinha1', role: 'cozinha', full_name: 'Maria José - Chef', email: 'cozinha1@mariaflor.com' },
        { id: 6, username: 'cozinha2', role: 'cozinha', full_name: 'Pedro Oliveira - Cozinheiro', email: 'cozinha2@mariaflor.com' },
        { id: 7, username: 'caixa1', role: 'caixa', full_name: 'Carla Lima - Operadora', email: 'caixa1@mariaflor.com' },
        { id: 8, username: 'caixa2', role: 'caixa', full_name: 'Roberto Costa - Caixa', email: 'caixa2@mariaflor.com' },
        { id: 9, username: 'estoque1', role: 'estoque', full_name: 'Fernanda Souza - Almoxarife', email: 'estoque1@mariaflor.com' },
        { id: 10, username: 'estoque2', role: 'estoque', full_name: 'Carlos Pereira - Controle', email: 'estoque2@mariaflor.com' }
    ],
    
    // Senhas válidas para teste
    passwords: {
        'admin': 'MariaFlor2025!',
        'gerente': 'Gerente123!',
        'garcom1': 'Garcom123!',
        'garcom2': 'Garcom123!',
        'cozinha1': 'Cozinha123!',
        'cozinha2': 'Cozinha123!',
        'caixa1': 'Caixa123!',
        'caixa2': 'Caixa123!',
        'estoque1': 'Estoque123!',
        'estoque2': 'Estoque123!'
    },
    
    // Dados do dashboard
    dashboard: {
        vendas_hoje: 1250.75,
        pedidos_pendentes: 5,
        produtos_vendidos: 47,
        ticket_medio: 26.61,
        vendas_semana: [120, 135, 180, 95, 220, 340, 280],
        top_produtos: [
            { nome: 'X-Bacon', quantidade: 12, valor: 180.00 },
            { nome: 'Coca-Cola 350ml', quantidade: 18, valor: 108.00 },
            { nome: 'Batata Frita', quantidade: 8, valor: 64.00 },
            { nome: 'Pizza Margherita', quantidade: 4, valor: 120.00 },
            { nome: 'Cerveja Brahma', quantidade: 15, valor: 90.00 }
        ]
    },
    
    // Produtos simulados
    products: [
        { id: 1, name: 'X-Bacon', price: 15.00, category: 'Lanches', stock: 25 },
        { id: 2, name: 'Coca-Cola 350ml', price: 6.00, category: 'Bebidas', stock: 48 },
        { id: 3, name: 'Batata Frita', price: 8.00, category: 'Acompanhamentos', stock: 15 },
        { id: 4, name: 'Pizza Margherita', price: 30.00, category: 'Pizzas', stock: 8 },
        { id: 5, name: 'Cerveja Brahma', price: 6.00, category: 'Bebidas', stock: 32 }
    ],
    
    // Mesas simuladas
    mesas: [
        { numero: 1, status: 'livre', ocupacao: null },
        { numero: 2, status: 'ocupada', ocupacao: '10:30', valor: 45.50 },
        { numero: 3, status: 'livre', ocupacao: null },
        { numero: 4, status: 'ocupada', ocupacao: '11:15', valor: 78.90 },
        { numero: 5, status: 'reservada', ocupacao: '12:00', cliente: 'João Silva' },
        { numero: 6, status: 'livre', ocupacao: null }
    ]
};

// Simular API Local
window.localAPI = {
    // Autenticação
    async login(username, password) {
        console.log('[LOCAL API] Tentativa de login:', username);
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const user = localData.users.find(u => u.username === username);
        const validPassword = localData.passwords[username];
        
        if (user && password === validPassword) {
            const token = 'local-token-' + Date.now();
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            console.log('[LOCAL API] Login bem-sucedido:', user);
            return {
                success: true,
                token: token,
                user: user
            };
        } else {
            console.log('[LOCAL API] Login falhou');
            return {
                success: false,
                error: 'Credenciais inválidas'
            };
        }
    },
    
    // Dashboard
    async getDashboard() {
        console.log('[LOCAL API] Carregando dashboard...');
        await new Promise(resolve => setTimeout(resolve, 300));
        return {
            success: true,
            data: localData.dashboard
        };
    },
    
    // Produtos
    async getProducts() {
        console.log('[LOCAL API] Carregando produtos...');
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            success: true,
            data: localData.products
        };
    },
    
    // Mesas
    async getMesas() {
        console.log('[LOCAL API] Carregando mesas...');
        await new Promise(resolve => setTimeout(resolve, 200));
        return {
            success: true,
            data: localData.mesas
        };
    },
    
    // Vendas
    async createSale(saleData) {
        console.log('[LOCAL API] Criando venda:', saleData);
        await new Promise(resolve => setTimeout(resolve, 400));
        
        const sale = {
            id: Date.now(),
            ...saleData,
            created_at: new Date().toISOString()
        };
        
        return {
            success: true,
            data: sale
        };
    }
};

// Override do fetch para interceptar chamadas de API
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
    console.log('[LOCAL API] Intercepting fetch:', url);
    
    // Se for uma chamada para API e estivermos em modo local
    if (window.LOCAL_MODE && url.includes('/api/')) {
        return handleLocalAPICall(url, options);
    }
    
    // Caso contrário, usar fetch original
    return originalFetch(url, options);
};

// Handler para chamadas de API local
async function handleLocalAPICall(url, options) {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : null;
    
    let response;
    
    try {
        if (url.includes('/auth/login')) {
            response = await window.localAPI.login(body.username, body.password);
        } else if (url.includes('/dashboard')) {
            response = await window.localAPI.getDashboard();
        } else if (url.includes('/products')) {
            response = await window.localAPI.getProducts();
        } else if (url.includes('/mesas')) {
            response = await window.localAPI.getMesas();
        } else if (url.includes('/sales') && method === 'POST') {
            response = await window.localAPI.createSale(body);
        } else {
            response = {
                success: false,
                error: 'Endpoint não implementado no modo local'
            };
        }
        
        return {
            ok: response.success,
            status: response.success ? 200 : 400,
            json: async () => response
        };
        
    } catch (error) {
        console.error('[LOCAL API] Erro:', error);
        return {
            ok: false,
            status: 500,
            json: async () => ({
                success: false,
                error: error.message
            })
        };
    }
}

// Inicialização do modo local
function initLocalMode() {
    console.log('🚀 Modo Local Ativado - Sistema Maria Flor');
    console.log('📋 Usuários disponíveis:');
    
    localData.users.forEach(user => {
        const password = localData.passwords[user.username];
        console.log(`   ${user.username} / ${password} (${user.role})`);
    });
    
    console.log('\n💡 Use as credenciais acima para fazer login');
    
    // Mostrar banner de modo local na tela
    showLocalModeBanner();
}

// Mostrar banner de modo local
function showLocalModeBanner() {
    const banner = document.createElement('div');
    banner.id = 'local-mode-banner';
    banner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 8px;
        text-align: center;
        font-size: 12px;
        z-index: 9999;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    `;
    banner.innerHTML = `
        🧪 MODO LOCAL ATIVADO - Sistema funcionando offline com dados simulados
        <button onclick="document.getElementById('local-mode-banner').style.display='none'" 
                style="margin-left: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 2px 8px; border-radius: 3px; cursor: pointer;">
            ✕
        </button>
    `;
    
    document.body.appendChild(banner);
    
    // Ajustar padding do body para acomodar o banner
    document.body.style.paddingTop = '35px';
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLocalMode);
} else {
    initLocalMode();
}

console.log('✅ Local API Server carregado com sucesso!');