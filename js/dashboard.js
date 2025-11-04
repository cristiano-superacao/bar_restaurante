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

    // Se não houver token, redireciona para a página de login
    if (!authToken) {
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
        userRoleDisplay.textContent = userRole;
    }


    // Adiciona funcionalidade de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Limpa o localStorage
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');

            // Redireciona para a página de login
            window.location.href = 'index.html';
        });
    }
});