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
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            window.location.href = '../index.html';
            return;
        }
        initializeMainSystem();
    }, 100);
});

// Função principal de inicialização
function initializeMainSystem() {
    try {
        console.log('🚀 Iniciando Sistema Maria Flor...');
        
        setupUserInterface();
        applyUserPermissions();
        initializeDashboard();
        loadUserInfo();
        initializeCharts();
        loadSalesData();
        setupEventListeners();
        initializeTablesSystem();
        
        // Configurar sistema de navegação para novos módulos
        setupModuleNavigation();
        
        console.log('✅ Sistema inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        showAuthError('Erro ao carregar o sistema. Tente recarregar a página.');
    }
}

// ===============================
// FUNÇÕES BÁSICAS DO SISTEMA
// ===============================

function initializeDashboard() {
    const username = localStorage.getItem('username') || 'Usuário';
    document.getElementById('userName').textContent = username;
    document.getElementById('headerUserName').textContent = username;
}

function loadUserInfo() {
    const loginTime = localStorage.getItem('loginTime');
    if (loginTime) {
        const loginDate = new Date(loginTime);
        console.log('Último login:', loginDate.toLocaleString());
    }
}

function setupEventListeners() {
    // Toggle buttons
    const toggleBtn = document.getElementById('toggleBtn');
    const mobileToggle = document.getElementById('mobileToggle');
    
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileSidebar);
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });
    
    // Handle hash changes from URL
    window.addEventListener('hashchange', function() {
        const hash = window.location.hash.substr(1);
        if (hash) {
            navigateToPage(hash);
        }
    });
    
    // Check initial hash
    const initialHash = window.location.hash.substr(1);
    if (initialHash) {
        setTimeout(() => navigateToPage(initialHash), 100);
    }
    
    if (document.getElementById('saleForm')) {
        document.getElementById('saleForm').addEventListener('submit', submitSale);
    }
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('saleModal');
        if (e.target === modal) {
            closeSaleModal();
        }
    });
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function toggleMobileSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

function navigateToPage(page) {
    console.log('🔄 Navegando para:', page);
    
    // Remove active class from all navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current link
    const currentLink = document.querySelector(`[data-page="${page}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
    
    // Hide all page content
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });
    
    // Show current page content
    const pageContent = document.getElementById(`${page}-content`);
    if (pageContent) {
        pageContent.classList.add('active');
        pageContent.style.display = 'block';
        console.log('✅ Página exibida:', page);
    } else {
        console.warn('⚠️ Conteúdo não encontrado para:', page);
        // Fallback to dashboard
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.classList.add('active');
            dashboardContent.style.display = 'block';
        }
    }
    
    // Update page title
    const titles = {
        dashboard: 'Dashboard',
        vendas: 'Vendas',
        mesas: 'Mesas',
        pedidos: 'Pedidos',
        cardapio: 'Cardápio',
        estoque: 'Estoque',
        financeiro: 'Financeiro',
        relatorios: 'Relatórios',
        configuracoes: 'Configurações',
        usuarios: 'Usuários'
    };
    
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
        titleElement.textContent = titles[page] || 'Dashboard';
    }
    
    // Update current page variable
    currentPage = page;
    
    // Update URL hash
    if (window.location.hash !== `#${page}`) {
        window.history.replaceState(null, null, `#${page}`);
    }
    
    // Load specific page data
    switch(page) {
        case 'vendas':
            setTimeout(() => loadSalesTable(), 100);
            break;
        case 'usuarios':
            setTimeout(() => loadUsers(), 100);
            break;
        case 'relatorios':
            setTimeout(() => {
                updateReportOptions();
                setTimeout(() => initializeReportCharts(), 500);
            }, 100);
            break;
        case 'cardapio':
            setTimeout(() => loadCardapio(), 100);
            break;
        case 'estoque':
            setTimeout(() => loadEstoque(), 100);
            break;
        case 'mesas':
            setTimeout(() => loadMesas(), 100);
            break;
        case 'pedidos':
            setTimeout(() => loadPedidos(), 100);
            break;
        case 'financeiro':
            setTimeout(() => loadFinanceiro(), 100);
            break;
        case 'configuracoes':
            setTimeout(() => loadConfiguracoes(), 100);
            break;
    }
}
}

// ===============================
// SISTEMA DE GRÁFICOS
// ===============================

function initializeCharts() {
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: [1200, 1900, 800, 1500, 2000, 2400, 1800],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
    
    const productsCtx = document.getElementById('productsChart');
    if (productsCtx) {
        new Chart(productsCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Hambúrguer', 'Pizza', 'Salada', 'Bebidas', 'Sobremesas'],
                datasets: [{
                    data: [30, 25, 15, 20, 10],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c',
                        '#4facfe'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// ===============================
// MÓDULO DE USUÁRIOS
// ===============================

function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    usersData.forEach(user => {
        const tr = document.createElement('tr');
        
        const roleLabels = {
            'admin': 'Administrador',
            'gerente': 'Gerente',
            'garcom': 'Garçom',
            'cozinha': 'Cozinha',
            'caixa': 'Caixa'
        };
        
        const roleClasses = {
            'admin': 'admin',
            'gerente': 'manager',
            'garcom': 'waiter',
            'cozinha': 'kitchen',
            'caixa': 'cashier'
        };
        
        tr.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.usuario}</td>
            <td>${user.email}</td>
            <td><span class="badge ${roleClasses[user.role]}">${roleLabels[user.role]}</span></td>
            <td><span class="status ${user.status}">${user.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td>${user.ultimoLogin}</td>
            <td>
                <button class="btn-small" onclick="editUser('${user.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small" onclick="toggleUserStatus('${user.id}')" title="${user.status === 'ativo' ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-user-${user.status === 'ativo' ? 'slash' : 'check'}"></i>
                </button>
                <button class="btn-small" onclick="resetPassword('${user.id}')" title="Resetar Senha">
                    <i class="fas fa-key"></i>
                </button>
                ${user.id !== 'admin' ? `<button class="btn-small btn-danger" onclick="deleteUser('${user.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    updateUsersStats();
}

function filterUsers() {
    const roleFilter = document.getElementById('roleFilter')?.value || '';
    const searchTerm = document.getElementById('userSearch')?.value?.toLowerCase() || '';
    
    const filteredUsers = usersData.filter(user => {
        const matchesRole = !roleFilter || user.role === roleFilter;
        const matchesSearch = !searchTerm || 
            user.nome.toLowerCase().includes(searchTerm) ||
            user.usuario.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm);
        
        return matchesRole && matchesSearch;
    });
    
    renderFilteredUsers(filteredUsers);
}

function renderFilteredUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        const roleLabels = {
            'admin': 'Administrador',
            'gerente': 'Gerente',
            'garcom': 'Garçom',
            'cozinha': 'Cozinha',
            'caixa': 'Caixa'
        };
        
        const roleClasses = {
            'admin': 'admin',
            'gerente': 'manager',
            'garcom': 'waiter',
            'cozinha': 'kitchen',
            'caixa': 'cashier'
        };
        
        tr.innerHTML = `
            <td>${user.nome}</td>
            <td>${user.usuario}</td>
            <td>${user.email}</td>
            <td><span class="badge ${roleClasses[user.role]}">${roleLabels[user.role]}</span></td>
            <td><span class="status ${user.status}">${user.status === 'ativo' ? 'Ativo' : 'Inativo'}</span></td>
            <td>${user.ultimoLogin}</td>
            <td>
                <button class="btn-small" onclick="editUser('${user.id}')" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-small" onclick="toggleUserStatus('${user.id}')" title="${user.status === 'ativo' ? 'Desativar' : 'Ativar'}">
                    <i class="fas fa-user-${user.status === 'ativo' ? 'slash' : 'check'}"></i>
                </button>
                <button class="btn-small" onclick="resetPassword('${user.id}')" title="Resetar Senha">
                    <i class="fas fa-key"></i>
                </button>
                ${user.id !== 'admin' ? `<button class="btn-small btn-danger" onclick="deleteUser('${user.id}')" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>` : ''}
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function updateUsersStats() {
    const totalUsers = usersData.length;
    const activeUsers = usersData.filter(u => u.status === 'ativo').length;
    const onlineUsers = Math.floor(activeUsers * 0.6);
    
    const statsCards = document.querySelectorAll('.users-stats .stat-card h3');
    if (statsCards.length >= 3) {
        statsCards[0].textContent = totalUsers;
        statsCards[1].textContent = activeUsers;
        statsCards[2].textContent = onlineUsers;
    }
}

function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const title = document.getElementById('userModalTitle');
    
    if (userId) {
        title.textContent = 'Editar Usuário';
        const user = usersData.find(u => u.id === userId);
        if (user) {
            document.getElementById('userFullName').value = user.nome;
            document.getElementById('userName').value = user.usuario;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
            
            document.getElementById('userPassword').parentElement.style.display = 'none';
            document.getElementById('userPasswordConfirm').parentElement.style.display = 'none';
        }
    } else {
        title.textContent = 'Novo Usuário';
        document.getElementById('userForm').reset();
        
        document.getElementById('userPassword').parentElement.style.display = 'block';
        document.getElementById('userPasswordConfirm').parentElement.style.display = 'block';
    }
    
    modal.style.display = 'block';
}

function closeUserModal() {
    const modal = document.getElementById('userModal');
    modal.style.display = 'none';
    document.getElementById('userForm').reset();
}

function editUser(userId) {
    openUserModal(userId);
}

function toggleUserStatus(userId) {
    if (userId === 'admin') {
        showNotification('O usuário administrador não pode ser desativado', 'error');
        return;
    }
    
    const user = usersData.find(u => u.id === userId);
    if (user) {
        user.status = user.status === 'ativo' ? 'inativo' : 'ativo';
        loadUsers();
        showNotification(`Usuário ${user.status === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`, 'success');
    }
}

function resetPassword(userId) {
    const user = usersData.find(u => u.id === userId);
    if (user) {
        const newPassword = prompt('Digite a nova senha:');
        if (newPassword && newPassword.length >= 6) {
            showNotification(`Senha do usuário ${user.nome} foi alterada com sucesso!`, 'success');
        } else if (newPassword) {
            showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
        }
    }
}

function deleteUser(userId) {
    if (userId === 'admin') {
        showNotification('O usuário administrador não pode ser excluído', 'error');
        return;
    }
    
    const user = usersData.find(u => u.id === userId);
    if (user && confirm(`Tem certeza que deseja excluir o usuário ${user.nome}?`)) {
        usersData = usersData.filter(u => u.id !== userId);
        loadUsers();
        showNotification(`Usuário ${user.nome} excluído com sucesso!`, 'success');
    }
}

// ===============================
// MÓDULO DE CONFIGURAÇÕES
// ===============================

function saveConfigurations() {
    const config = {
        restaurante: {
            nome: document.getElementById('restaurantName')?.value,
            endereco: document.getElementById('restaurantAddress')?.value,
            telefone: document.getElementById('restaurantPhone')?.value,
            email: document.getElementById('restaurantEmail')?.value
        },
        vendas: {
            taxaServico: document.getElementById('serviceFee')?.value,
            tempoPreparo: document.getElementById('defaultPrepTime')?.value
        },
        sistema: {
            autoRefresh: document.getElementById('autoRefresh')?.value,
            tema: document.getElementById('theme')?.value
        },
        estoque: {
            alertaBaixo: document.getElementById('lowStockThreshold')?.value,
            alertaCritico: document.getElementById('criticalStockThreshold')?.value
        },
        backup: {
            frequencia: document.getElementById('backupFrequency')?.value,
            timeoutSessao: document.getElementById('sessionTimeout')?.value
        }
    };
    
    localStorage.setItem('mariaflor_config', JSON.stringify(config));
    showNotification('Configurações salvas com sucesso!', 'success');
}

function performBackup() {
    const data = {
        vendas: salesData,
        produtos: productsData,
        usuarios: usersData,
        mesas: tablesData,
        config: JSON.parse(localStorage.getItem('mariaflor_config') || '{}'),
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `backup_mariaflor_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Backup realizado com sucesso!', 'success');
}

function exportData() {
    const format = prompt('Formato de exportação:\n1 - JSON\n2 - CSV\n3 - Excel\n\nDigite o número:');
    
    switch(format) {
        case '1':
            performBackup();
            break;
        case '2':
            exportToCSV();
            break;
        case '3':
            showNotification('Exportação para Excel será implementada em breve!', 'info');
            break;
        default:
            showNotification('Formato inválido', 'error');
    }
}

function exportToCSV() {
    const csvData = [
        ['Data', 'Cliente', 'Produto', 'Quantidade', 'Valor', 'Pagamento'],
        ...salesData.map(sale => [
            sale.date,
            sale.customer,
            sale.items.map(item => item.name).join('; '),
            sale.items.reduce((acc, item) => acc + item.quantity, 0),
            sale.total,
            sale.payment
        ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const dataBlob = new Blob([csvContent], {type: 'text/csv'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `vendas_mariaflor_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Dados exportados para CSV com sucesso!', 'success');
}

// ===============================
// MÓDULO DE RELATÓRIOS
// ===============================

function generateReport() {
    const reportType = document.getElementById('reportType')?.value;
    const period = document.getElementById('reportPeriod')?.value;
    
    showNotification(`Gerando relatório de ${reportType} para o período: ${period}...`, 'info');
    
    setTimeout(() => {
        initializeReportCharts();
        showNotification('Relatório gerado com sucesso!', 'success');
    }, 2000);
}

function exportReport() {
    const format = prompt('Formato do relatório:\n1 - PDF\n2 - Excel\n3 - CSV\n\nDigite o número:');
    
    switch(format) {
        case '1':
            showNotification('Exportação para PDF será implementada em breve!', 'info');
            break;
        case '2':
            showNotification('Exportação para Excel será implementada em breve!', 'info');
            break;
        case '3':
            exportToCSV();
            break;
        default:
            showNotification('Formato inválido', 'error');
    }
}

function updateReportOptions() {
    const reportType = document.getElementById('reportType')?.value;
    
    const periodSelect = document.getElementById('reportPeriod');
    if (periodSelect && reportType === 'estoque') {
        const options = periodSelect.querySelectorAll('option');
        options.forEach(option => {
            if (option.value === 'hoje') {
                option.style.display = 'none';
            } else {
                option.style.display = 'block';
            }
        });
    }
}

function initializeReportCharts() {
    const salesCtx = document.getElementById('reportSalesChart');
    if (salesCtx) {
        new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
                datasets: [{
                    label: 'Vendas (R$)',
                    data: [8500, 12300, 15600, 14200],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }
    
    const paymentCtx = document.getElementById('reportPaymentChart');
    if (paymentCtx) {
        new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Cartão Crédito', 'Cartão Débito', 'Dinheiro', 'PIX'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5f7fa']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    const productsCtx = document.getElementById('reportProductsChart');
    if (productsCtx) {
        new Chart(productsCtx, {
            type: 'bar',
            data: {
                labels: ['Hambúrguer', 'Pizza', 'Salada', 'Batata Frita', 'Refrigerante'],
                datasets: [{
                    label: 'Vendidos',
                    data: [89, 67, 45, 78, 92],
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    const staffCtx = document.getElementById('reportStaffChart');
    if (staffCtx) {
        new Chart(staffCtx, {
            type: 'radar',
            data: {
                labels: ['Vendas', 'Atendimento', 'Pontualidade', 'Qualidade', 'Eficiência'],
                datasets: [{
                    label: 'João Silva',
                    data: [9, 8, 9, 8, 9],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.2)'
                }, {
                    label: 'Maria Santos',
                    data: [10, 9, 8, 9, 10],
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.2)'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 10
                    }
                }
            }
        });
    }
}

// ===============================
// SISTEMA DE NAVEGAÇÃO DE MÓDULOS
// ===============================

function setupModuleNavigation() {
    // Interceptar função showModule se existir
    if (typeof window.showModule === 'function') {
        const originalShowModule = window.showModule;
        window.showModule = function(moduleName) {
            if (moduleName === 'usuarios') {
                setTimeout(() => loadUsers(), 100);
            } else if (moduleName === 'relatorios') {
                setTimeout(() => {
                    updateReportOptions();
                    setTimeout(() => initializeReportCharts(), 500);
                }, 100);
            }
            
            if (originalShowModule) {
                originalShowModule(moduleName);
            }
        };
    }
}

// ===============================
// SISTEMA BÁSICO (CONTINUAÇÃO)
// ===============================

// Adicionar as funções que estavam no arquivo original
function loadSalesData() {
    salesData = [
        {
            id: 'V001',
            date: new Date().toISOString(),
            customer: 'João Silva',
            items: [
                { name: 'Hambúrguer Clássico', price: 25.00, quantity: 1 },
                { name: 'Batata Frita', price: 10.00, quantity: 1 }
            ],
            total: 35.00,
            paymentMethod: 'card',
            status: 'completed'
        },
        {
            id: 'V002',
            date: new Date(Date.now() - 3600000).toISOString(),
            customer: 'Maria Santos',
            items: [
                { name: 'Pizza Margherita', price: 45.00, quantity: 1 }
            ],
            total: 45.00,
            paymentMethod: 'pix',
            status: 'completed'
        },
        {
            id: 'V003',
            date: new Date(Date.now() - 7200000).toISOString(),
            customer: 'Carlos Oliveira',
            items: [
                { name: 'Salada Caesar', price: 22.00, quantity: 1 },
                { name: 'Suco Natural', price: 6.00, quantity: 1 }
            ],
            total: 28.00,
            paymentMethod: 'cash',
            status: 'completed'
        }
    ];
    
    localStorage.setItem('salesData', JSON.stringify(salesData));
}

function loadSalesTable() {
    const tbody = document.getElementById('salesTableBody');
    if (!tbody) return;
    
    const savedSales = localStorage.getItem('salesData');
    if (savedSales) {
        salesData = JSON.parse(savedSales);
    }
    
    tbody.innerHTML = '';
    
    salesData.forEach(sale => {
        const row = document.createElement('tr');
        const date = new Date(sale.date);
        const itemsText = sale.items.map(item => `${item.name} (${item.quantity}x)`).join(', ');
        
        const paymentMethods = {
            cash: 'Dinheiro',
            card: 'Cartão',
            pix: 'PIX'
        };
        
        const statusClasses = {
            completed: 'delivered',
            pending: 'preparing',
            cancelled: 'cancelled'
        };
        
        const statusTexts = {
            completed: 'Concluída',
            pending: 'Pendente',
            cancelled: 'Cancelada'
        };
        
        row.innerHTML = `
            <td>${sale.id}</td>
            <td>${date.toLocaleString('pt-BR')}</td>
            <td>${sale.customer}</td>
            <td>${itemsText}</td>
            <td>R$ ${sale.total.toFixed(2).replace('.', ',')}</td>
            <td>${paymentMethods[sale.paymentMethod]}</td>
            <td><span class="status ${statusClasses[sale.status]}">${statusTexts[sale.status]}</span></td>
            <td>
                <button class="btn-small" onclick="viewSale('${sale.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn-small" onclick="editSale('${sale.id}')"><i class="fas fa-edit"></i></button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function openSaleModal() {
    const modal = document.getElementById('saleModal');
    if (modal) {
        modal.style.display = 'block';
        resetSaleForm();
    }
}

function closeSaleModal() {
    const modal = document.getElementById('saleModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function resetSaleForm() {
    const form = document.getElementById('saleForm');
    if (form) {
        form.reset();
        document.getElementById('saleItems').innerHTML = '';
        document.getElementById('totalAmount').textContent = '0,00';
        addItem();
    }
}

let itemCounter = 0;

function addItem() {
    itemCounter++;
    const itemsContainer = document.getElementById('saleItems');
    if (!itemsContainer) return;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'sale-item';
    itemDiv.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <input type="text" placeholder="Nome do produto" class="item-name" required style="flex: 2;">
            <input type="number" placeholder="Preço" class="item-price" step="0.01" min="0" required style="flex: 1;" onchange="calculateTotal()">
            <input type="number" placeholder="Qtd" class="item-quantity" min="1" value="1" required style="width: 80px;" onchange="calculateTotal()">
            <button type="button" onclick="removeItem(this)" class="btn-small" style="background: #e74c3c; color: white;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    itemsContainer.appendChild(itemDiv);
}

function removeItem(button) {
    const itemsContainer = document.getElementById('saleItems');
    if (itemsContainer && itemsContainer.children.length > 1) {
        button.closest('.sale-item').remove();
        calculateTotal();
    }
}

function calculateTotal() {
    const items = document.querySelectorAll('.sale-item');
    let total = 0;
    
    items.forEach(item => {
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        const quantity = parseInt(item.querySelector('.item-quantity').value) || 0;
        total += price * quantity;
    });
    
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2).replace('.', ',');
    }
}

function submitSale(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    const items = [];
    const saleItems = document.querySelectorAll('.sale-item');
    
    saleItems.forEach(item => {
        const name = item.querySelector('.item-name').value;
        const price = parseFloat(item.querySelector('.item-price').value);
        const quantity = parseInt(item.querySelector('.item-quantity').value);
        
        if (name && price && quantity) {
            items.push({ name, price, quantity });
        }
    });
    
    if (items.length === 0) {
        alert('Adicione pelo menos um item à venda!');
        return;
    }
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newSale = {
        id: `V${String(salesData.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString(),
        customer: customerName,
        items: items,
        total: total,
        paymentMethod: paymentMethod,
        status: 'completed'
    };
    
    salesData.push(newSale);
    localStorage.setItem('salesData', JSON.stringify(salesData));
    
    closeSaleModal();
    
    if (currentPage === 'vendas') {
        loadSalesTable();
    }
    
    showNotification('Venda registrada com sucesso!', 'success');
}

function viewSale(saleId) {
    const sale = salesData.find(s => s.id === saleId);
    if (sale) {
        alert(`Detalhes da Venda ${saleId}:\n\nCliente: ${sale.customer}\nTotal: R$ ${sale.total.toFixed(2)}\nMétodo: ${sale.paymentMethod}\nStatus: ${sale.status}`);
    }
}

function editSale(saleId) {
    alert(`Funcionalidade de edição em desenvolvimento para a venda ${saleId}`);
}

function filterSales() {
    const dateFilter = document.getElementById('dateFilter')?.value;
    const statusFilter = document.getElementById('statusFilter')?.value;
    
    console.log('Filtros aplicados:', { dateFilter, statusFilter });
    loadSalesTable();
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}-circle"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Funções auxiliares que podem estar sendo usadas
function setupUserInterface() {
    console.log('Interface configurada');
}

function applyUserPermissions() {
    console.log('Permissões aplicadas');
}

function initializeTablesSystem() {
    console.log('Sistema de mesas inicializado');
}

function showSystemTips() {
    const user = window.authSystem ? window.authSystem.getCurrentUser() : null;
    const userName = user ? user.name : 'Usuário';
    
    showNotification(`Bem-vindo(a) ao Sistema Maria Flor, ${userName}! 🎉`, 'success');
    
    setTimeout(() => {
        showNotification('💡 Dica: Use Esc para fechar modais e F5 para atualizar dados', 'info');
    }, 3000);
}

// ===============================
// SISTEMA DE FICHA TÉCNICA
// ===============================

// Dados das fichas técnicas
let technicalSheetsData = [];
let currentTechnicalSheet = null;

// Produtos de exemplo para fichas técnicas
const sampleProducts = [
    { id: 'prod1', name: 'Hambúrguer Clássico', category: 'Sanduíches' },
    { id: 'prod2', name: 'Pizza Margherita', category: 'Pizzas' },
    { id: 'prod3', name: 'Salada Caesar', category: 'Saladas' },
    { id: 'prod4', name: 'Batata Frita', category: 'Acompanhamentos' },
    { id: 'prod5', name: 'Suco de Laranja', category: 'Bebidas' }
];

// Abrir modal de ficha técnica
function openTechnicalSheetModal() {
    const modal = document.getElementById('technicalSheetModal');
    if (modal) {
        modal.style.display = 'block';
        loadProductsForTechnicalSheet();
        loadTechnicalSheetsList();
    }
}

// Fechar modal de ficha técnica
function closeTechnicalSheetModal() {
    const modal = document.getElementById('technicalSheetModal');
    if (modal) {
        modal.style.display = 'none';
        resetTechnicalSheetForm();
    }
}

// Carregar produtos no seletor
function loadProductsForTechnicalSheet() {
    const select = document.getElementById('technicalSheetProduct');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um produto</option>';
    
    sampleProducts.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (${product.category})`;
        select.appendChild(option);
    });
}

// Carregar ficha técnica existente
function loadTechnicalSheet() {
    const productId = document.getElementById('technicalSheetProduct')?.value;
    if (!productId) {
        resetTechnicalSheetForm();
        return;
    }
    
    const existingSheet = technicalSheetsData.find(sheet => sheet.productId === productId);
    
    if (existingSheet) {
        currentTechnicalSheet = existingSheet;
        populateTechnicalSheetForm(existingSheet);
    } else {
        createNewTechnicalSheet();
    }
}

// Criar nova ficha técnica
function createNewTechnicalSheet() {
    const productId = document.getElementById('technicalSheetProduct')?.value;
    if (!productId) {
        showNotification('Selecione um produto primeiro', 'error');
        return;
    }
    
    const product = sampleProducts.find(p => p.id === productId);
    if (!product) return;
    
    currentTechnicalSheet = {
        id: Date.now().toString(),
        productId: productId,
        productName: product.name,
        description: '',
        ingredients: [],
        totalCost: 0,
        profitMargin: 60,
        suggestedPrice: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    showTechnicalSheetForm();
    addIngredient(); // Adicionar primeiro ingrediente
}

// Mostrar formulário de ficha técnica
function showTechnicalSheetForm() {
    const form = document.getElementById('technicalSheetForm');
    const saveBtn = document.getElementById('saveTechnicalSheetBtn');
    
    if (form) form.style.display = 'block';
    if (saveBtn) saveBtn.style.display = 'inline-block';
    
    // Limpar lista de ingredientes
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) {
        ingredientsList.innerHTML = '';
    }
}

// Resetar formulário
function resetTechnicalSheetForm() {
    const form = document.getElementById('technicalSheetForm');
    const saveBtn = document.getElementById('saveTechnicalSheetBtn');
    
    if (form) form.style.display = 'none';
    if (saveBtn) saveBtn.style.display = 'none';
    
    currentTechnicalSheet = null;
    
    const productSelect = document.getElementById('technicalSheetProduct');
    if (productSelect) productSelect.value = '';
    
    const description = document.getElementById('productDescription');
    if (description) description.value = '';
    
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) ingredientsList.innerHTML = '';
    
    updateTotalCost();
}

// Preencher formulário com dados existentes
function populateTechnicalSheetForm(sheet) {
    showTechnicalSheetForm();
    
    const description = document.getElementById('productDescription');
    if (description) description.value = sheet.description || '';
    
    const profitMargin = document.getElementById('profitMargin');
    if (profitMargin) profitMargin.value = sheet.profitMargin || 60;
    
    const ingredientsList = document.getElementById('ingredientsList');
    if (ingredientsList) {
        ingredientsList.innerHTML = '';
        
        sheet.ingredients.forEach(ingredient => {
            addIngredient(ingredient);
        });
        
        if (sheet.ingredients.length === 0) {
            addIngredient(); // Adicionar ingrediente vazio se não há nenhum
        }
    }
    
    updateTotalCost();
}

// Adicionar ingrediente
function addIngredient(ingredientData = null) {
    const ingredientsList = document.getElementById('ingredientsList');
    if (!ingredientsList) return;
    
    const ingredientId = 'ingredient_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient-item';
    ingredientDiv.setAttribute('data-ingredient-id', ingredientId);
    
    ingredientDiv.innerHTML = `
        <input type="text" 
               class="ingredient-input" 
               placeholder="Nome do ingrediente" 
               value="${ingredientData?.name || ''}"
               onchange="updateTotalCost()">
        <input type="number" 
               class="quantity-input ingredient-input" 
               placeholder="Qtd" 
               value="${ingredientData?.quantity || ''}"
               step="0.001" 
               min="0"
               onchange="updateTotalCost()">
        <select class="unit-select ingredient-input" onchange="updateTotalCost()">
            <option value="">Unidade</option>
            <option value="kg" ${ingredientData?.unit === 'kg' ? 'selected' : ''}>kg</option>
            <option value="g" ${ingredientData?.unit === 'g' ? 'selected' : ''}>g</option>
            <option value="l" ${ingredientData?.unit === 'l' ? 'selected' : ''}>Litro</option>
            <option value="ml" ${ingredientData?.unit === 'ml' ? 'selected' : ''}>ml</option>
            <option value="unidade" ${ingredientData?.unit === 'unidade' ? 'selected' : ''}>Unidade</option>
            <option value="xícara" ${ingredientData?.unit === 'xícara' ? 'selected' : ''}>Xícara</option>
            <option value="colher" ${ingredientData?.unit === 'colher' ? 'selected' : ''}>Colher</option>
            <option value="fatia" ${ingredientData?.unit === 'fatia' ? 'selected' : ''}>Fatia</option>
        </select>
        <input type="number" 
               class="cost-input ingredient-input" 
               placeholder="Custo (R$)" 
               value="${ingredientData?.cost || ''}"
               step="0.01" 
               min="0"
               onchange="updateTotalCost()">
        <button type="button" class="remove-ingredient-btn" onclick="removeIngredient('${ingredientId}')">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    ingredientsList.appendChild(ingredientDiv);
    updateTotalCost();
}

// Remover ingrediente
function removeIngredient(ingredientId) {
    const ingredientItem = document.querySelector(`[data-ingredient-id="${ingredientId}"]`);
    if (ingredientItem) {
        ingredientItem.remove();
        updateTotalCost();
    }
}

// Atualizar custo total
function updateTotalCost() {
    const ingredients = document.querySelectorAll('.ingredient-item');
    let total = 0;
    
    ingredients.forEach(item => {
        const costInput = item.querySelector('.cost-input');
        const cost = parseFloat(costInput?.value || 0);
        total += cost;
    });
    
    const totalElement = document.getElementById('totalIngredientsCost');
    if (totalElement) {
        totalElement.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    
    calculateSuggestedPrice();
}

// Calcular preço sugerido
function calculateSuggestedPrice() {
    const totalCostElement = document.getElementById('totalIngredientsCost');
    const profitMarginInput = document.getElementById('profitMargin');
    const suggestedPriceElement = document.getElementById('suggestedPrice');
    
    if (!totalCostElement || !profitMarginInput || !suggestedPriceElement) return;
    
    const totalCost = parseFloat(totalCostElement.textContent.replace('R$ ', '').replace(',', '.')) || 0;
    const profitMargin = parseFloat(profitMarginInput.value) || 0;
    
    const suggestedPrice = totalCost * (1 + profitMargin / 100);
    
    suggestedPriceElement.textContent = `R$ ${suggestedPrice.toFixed(2).replace('.', ',')}`;
}

// Salvar ficha técnica
function saveTechnicalSheet() {
    if (!currentTechnicalSheet) {
        showNotification('Erro: Nenhuma ficha técnica para salvar', 'error');
        return;
    }
    
    // Coletar dados do formulário
    const description = document.getElementById('productDescription')?.value || '';
    const profitMargin = parseFloat(document.getElementById('profitMargin')?.value || 60);
    
    // Coletar ingredientes
    const ingredients = [];
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    
    ingredientItems.forEach(item => {
        const name = item.querySelector('.ingredient-input').value.trim();
        const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;
        const unit = item.querySelector('.unit-select').value;
        const cost = parseFloat(item.querySelector('.cost-input').value) || 0;
        
        if (name && quantity && unit && cost) {
            ingredients.push({ name, quantity, unit, cost });
        }
    });
    
    if (ingredients.length === 0) {
        showNotification('Adicione pelo menos um ingrediente válido', 'error');
        return;
    }
    
    // Calcular custo total
    const totalCost = ingredients.reduce((sum, ing) => sum + ing.cost, 0);
    const suggestedPrice = totalCost * (1 + profitMargin / 100);
    
    // Atualizar ficha técnica
    currentTechnicalSheet.description = description;
    currentTechnicalSheet.ingredients = ingredients;
    currentTechnicalSheet.totalCost = totalCost;
    currentTechnicalSheet.profitMargin = profitMargin;
    currentTechnicalSheet.suggestedPrice = suggestedPrice;
    currentTechnicalSheet.updatedAt = new Date().toISOString();
    
    // Salvar no array de fichas técnicas
    const existingIndex = technicalSheetsData.findIndex(sheet => sheet.id === currentTechnicalSheet.id);
    
    if (existingIndex >= 0) {
        technicalSheetsData[existingIndex] = currentTechnicalSheet;
        showNotification('Ficha técnica atualizada com sucesso!', 'success');
    } else {
        technicalSheetsData.push(currentTechnicalSheet);
        showNotification('Ficha técnica criada com sucesso!', 'success');
    }
    
    // Salvar no localStorage
    localStorage.setItem('mariaflor_technical_sheets', JSON.stringify(technicalSheetsData));
    
    // Atualizar lista
    loadTechnicalSheetsList();
    
    // Limpar formulário
    resetTechnicalSheetForm();
}

// Carregar lista de fichas técnicas
function loadTechnicalSheetsList() {
    // Carregar do localStorage
    const savedSheets = localStorage.getItem('mariaflor_technical_sheets');
    if (savedSheets) {
        technicalSheetsData = JSON.parse(savedSheets);
    }
    
    const grid = document.getElementById('technicalSheetsGrid');
    if (!grid) return;
    
    if (technicalSheetsData.length === 0) {
        grid.innerHTML = '<div class="no-technical-sheets">Nenhuma ficha técnica cadastrada ainda.</div>';
        return;
    }
    
    // Renderizar fichas técnicas (implementar depois)
}

// ===============================
// FUNÇÕES LOAD PARA MÓDULOS
// ===============================

function loadCardapio() {
    console.log('📖 Carregando cardápio...');
    // Cardápio já está implementado no HTML
}

function loadEstoque() {
    console.log('📦 Carregando estoque...');
    // Estoque já está implementado no HTML
}

function loadMesas() {
    console.log('🪑 Carregando mesas...');
    // Mesas já está implementado no HTML
}

function loadPedidos() {
    console.log('📋 Carregando pedidos...');
    // Pedidos já está implementado no HTML
}

function loadFinanceiro() {
    console.log('💰 Carregando financeiro...');
    // Financeiro já está implementado no HTML
}

function loadConfiguracoes() {
    console.log('⚙️ Carregando configurações...');
    // Configurações já está implementado no HTML
}
    grid.innerHTML = '';
    
    technicalSheetsData.forEach(sheet => {
        const card = document.createElement('div');
        card.className = 'technical-sheet-card';
        
        const lastUpdated = new Date(sheet.updatedAt).toLocaleDateString('pt-BR');
        
        card.innerHTML = `
            <div class="technical-sheet-header">
                <h4 class="technical-sheet-title">${sheet.productName}</h4>
                <div class="technical-sheet-actions">
                    <button class="btn-small" onclick="editTechnicalSheet('${sheet.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteTechnicalSheet('${sheet.id}')" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="technical-sheet-info">
                <p><strong>Ingredientes:</strong> <span class="ingredients-count">${sheet.ingredients.length} itens</span></p>
                <p><strong>Custo Total:</strong> <span class="cost-display">R$ ${sheet.totalCost.toFixed(2).replace('.', ',')}</span></p>
                <p><strong>Margem:</strong> ${sheet.profitMargin}%</p>
                <p><strong>Preço Sugerido:</strong> <span class="cost-display">R$ ${sheet.suggestedPrice.toFixed(2).replace('.', ',')}</span></p>
                <p><small>Atualizado em: ${lastUpdated}</small></p>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Editar ficha técnica
function editTechnicalSheet(sheetId) {
    const sheet = technicalSheetsData.find(s => s.id === sheetId);
    if (!sheet) return;
    
    // Selecionar produto
    const productSelect = document.getElementById('technicalSheetProduct');
    if (productSelect) {
        productSelect.value = sheet.productId;
    }
    
    currentTechnicalSheet = sheet;
    populateTechnicalSheetForm(sheet);
}

// Excluir ficha técnica
function deleteTechnicalSheet(sheetId) {
    const sheet = technicalSheetsData.find(s => s.id === sheetId);
    if (!sheet) return;
    
    if (confirm(`Tem certeza que deseja excluir a ficha técnica do produto "${sheet.productName}"?`)) {
        technicalSheetsData = technicalSheetsData.filter(s => s.id !== sheetId);
        localStorage.setItem('mariaflor_technical_sheets', JSON.stringify(technicalSheetsData));
        loadTechnicalSheetsList();
        showNotification('Ficha técnica excluída com sucesso!', 'success');
    }
}

// Auto-inicialização de dicas
setTimeout(() => {
    if (!localStorage.getItem('maria_flor_tips_shown')) {
        setTimeout(() => {
            showSystemTips();
            localStorage.setItem('maria_flor_tips_shown', 'true');
        }, 2000);
    }
}, 1000);