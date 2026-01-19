// Sistema Dashboard Maria Flor - Versão Final Limpa
// ===================================================

// Configurações globais
let currentPage = 'dashboard';
let salesData = [];
let productsData = [];
let tablesData = [];
let usersData = [
    {
        id: 'admin',
        nome: 'Administrador',
        usuario: 'admin',
        email: 'admin@mariaflor.com',
        role: 'admin',
        status: 'ativo',
        ultimoLogin: new Date().toLocaleString(),
        criadoEm: '2025-10-01'
    },
    {
        id: 'gerente',
        nome: 'Maria Santos',
        usuario: 'gerente',
        email: 'gerente@mariaflor.com',
        role: 'gerente',
        status: 'ativo',
        ultimoLogin: new Date(Date.now() - 45*60000).toLocaleString(),
        criadoEm: '2025-10-01'
    },
    {
        id: 'garcom',
        nome: 'João Silva',
        usuario: 'garcom',
        email: 'garcom@mariaflor.com',
        role: 'garcom',
        status: 'ativo',
        ultimoLogin: new Date(Date.now() - 120*60000).toLocaleString(),
        criadoEm: '2025-10-01'
    },
    {
        id: 'cozinha',
        nome: 'Ana Costa',
        usuario: 'cozinha',
        email: 'cozinha@mariaflor.com',
        role: 'cozinha',
        status: 'ativo',
        ultimoLogin: new Date(Date.now() - 180*60000).toLocaleString(),
        criadoEm: '2025-10-01'
    },
    {
        id: 'caixa',
        nome: 'Carlos Oliveira',
        usuario: 'caixa',
        email: 'caixa@mariaflor.com',
        role: 'caixa',
        status: 'ativo',
        ultimoLogin: new Date(Date.now() - 240*60000).toLocaleString(),
        criadoEm: '2025-10-01'
    }
];

// Inicialização principal
document.addEventListener('DOMContentLoaded', function () {
    const authToken = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');
    const apiEnabled = typeof window !== 'undefined' && window.CONFIG && window.CONFIG.API && window.CONFIG.API.enabled;
    const activeCompanyId = localStorage.getItem('activeCompanyId');
    const activeCompanyName = localStorage.getItem('activeCompanyName');

    // Se não houver token, redireciona para a página de login
    if (!authToken) {
        window.location.href = 'index.html';
        return;
    }

    // Multi-empresa: superadmin precisa selecionar empresa antes de usar módulos
    if (apiEnabled && userRole === 'superadmin' && !activeCompanyId && !window.location.pathname.includes('empresas.html')) {
        window.location.href = 'empresas.html';
        return;
    }

    // Se API estiver habilitada, valida expiração do token
    if (apiEnabled && window.API && window.API.auth && !window.API.auth.isTokenValid()) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
        window.location.href = 'index.html';
        return;
    }

    // Exibe o nome de usuário e o cargo
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay && username) {
        usernameDisplay.textContent = username;
    }
    const userRoleDisplay = document.getElementById('user-role-display');
    if (userRoleDisplay && userRole) {
        if (userRole === 'superadmin') {
            userRoleDisplay.textContent = activeCompanyName
                ? `superadmin • ${activeCompanyName}`
                : 'superadmin • selecione empresa';
        } else {
            userRoleDisplay.textContent = userRole;
        }
    }

    // Logout agora centralizado em auth-neon.js

    // Carrega os dados do dashboard
    loadDashboardData();
});

function loadDashboardData() {
    const STORE = window.APP_STORAGE;

    // Ocupação de Mesas (usar chave 'tables' do módulo de Mesas)
    const mesas = STORE.get('tables', [], ['tables', 'mesas']) || [];
    const mesasOcupadas = mesas.filter(m => m.status === 'Ocupada').length;
    const totalMesas = mesas.length;
    const mesasEl = document.getElementById('mesas-ocupadas-valor');
    if (mesasEl) mesasEl.textContent = `${mesasOcupadas} / ${totalMesas}`;

    // Vendas Hoje
    const pedidos = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = pedidos
        .filter(p => p.data && p.data.startsWith(hoje) && p.status === 'Pago')
        .reduce((acc, p) => acc + (p.total || 0), 0);
    const vendasEl = document.getElementById('vendas-hoje-valor');
    if (vendasEl) {
        const fmt = window.CONFIG?.UTILS?.formatCurrency || (v => `R$ ${Number(v || 0).toFixed(2).replace('.', ',')}`);
        vendasEl.textContent = fmt(vendasHoje);
    }

    // Pedidos Pendentes
    const pedidosPendentes = pedidos.filter(p => p.status === 'Pendente').length;
    const pendentesEl = document.getElementById('pedidos-pendentes-valor');
    if(pendentesEl) pendentesEl.textContent = pedidosPendentes;

    // Itens em Baixa no Estoque
    const estoque = STORE.get('estoque', [], ['estoque']) || [];
    const itensEmBaixa = estoque.filter(item => item.quantidade < item.quantidadeMinima).length;
    const estoqueEl = document.getElementById('estoque-baixo-valor');
    if(estoqueEl) estoqueEl.textContent = itensEmBaixa;
}
