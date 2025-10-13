// Configurações globais
let currentPage = 'dashboard';
let salesData = [];
let productsData = [];
let tablesData = [];

// Inicialização principal unificada
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar carregamento do sistema de auth
    setTimeout(() => {
        if (!window.authSystem || !window.authSystem.isLoggedIn()) {
            window.location.href = '../index.html';
            return;
        }
        
        // Inicializar todo o sistema
        initializeMainSystem();
        
    }, 100);
});

// Função principal de inicialização
function initializeMainSystem() {
    try {
        console.log('🚀 Iniciando Sistema Maria Flor...');
        
        // 1. Configurar interface do usuário
        setupUserInterface();
        
        // 2. Aplicar permissões baseadas no role
        applyUserPermissions();
        
        // 3. Inicializar dashboard básico
        initializeDashboard();
        
        // 4. Carregar informações do usuário
        loadUserInfo();
        
        // 5. Inicializar gráficos
        initializeCharts();
        
        // 6. Carregar dados
        loadSalesData();
        
        // 7. Configurar event listeners
        setupEventListeners();
        
        // 8. Inicializar sistema de mesas
        initializeTablesSystem();
        
        console.log('✅ Sistema inicializado com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar sistema:', error);
        showAuthError('Erro ao carregar o sistema. Tente recarregar a página.');
    }
});

function initializeDashboard() {
    // Configurar nome do usuário
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

// Navegação entre páginas
function setupEventListeners() {
    // Toggle sidebar
    document.getElementById('toggleBtn').addEventListener('click', toggleSidebar);
    document.getElementById('mobileToggle').addEventListener('click', toggleMobileSidebar);
    
    // Navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateToPage(page);
        });
    });
    
    // Form de vendas
    document.getElementById('saleForm').addEventListener('submit', submitSale);
    
    // Fechar modal ao clicar fora
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
    // Verificar se é redirecionamento para página externa
    if (page === 'mesas') {
        window.location.href = 'mesas.html';
        return;
    }
    
    // Remover classe active de todos os links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Adicionar classe active ao link atual
    const currentLink = document.querySelector(`[data-page="${page}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
    
    // Esconder todos os conteúdos
    document.querySelectorAll('.page-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Mostrar conteúdo da página atual
    const pageContent = document.getElementById(`${page}-content`);
    if (pageContent) {
        pageContent.classList.add('active');
    }
    
    // Atualizar título da página
    const titles = {
        dashboard: 'Dashboard',
        vendas: 'Vendas',
        mesas: 'Mesas',
        pedidos: 'Pedidos',
        cardapio: 'Cardápio',
        estoque: 'Estoque',
        financeiro: 'Financeiro',
        relatorios: 'Relatórios',
        configuracoes: 'Configurações'
    };
    
    const titleElement = document.getElementById('pageTitle');
    if (titleElement) {
        titleElement.textContent = titles[page] || 'Dashboard';
    }
    currentPage = page;
    
    // Carregar dados específicos da página
    if (page === 'vendas') {
        loadSalesTable();
    }
}

// Inicializar gráficos
function initializeCharts() {
    // Gráfico de vendas por dia
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
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
    
    // Gráfico de produtos mais vendidos
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    new Chart(productsCtx, {
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

// Gerenciamento de vendas
function loadSalesData() {
    // Dados mockados para demonstração
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
    
    // Salvar no localStorage
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

// Modal de vendas
function openSaleModal() {
    document.getElementById('saleModal').style.display = 'block';
    resetSaleForm();
}

function closeSaleModal() {
    document.getElementById('saleModal').style.display = 'none';
}

function resetSaleForm() {
    document.getElementById('saleForm').reset();
    document.getElementById('saleItems').innerHTML = '';
    document.getElementById('totalAmount').textContent = '0,00';
    addItem(); // Adicionar primeiro item
}

let itemCounter = 0;

function addItem() {
    itemCounter++;
    const itemsContainer = document.getElementById('saleItems');
    
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
    if (itemsContainer.children.length > 1) {
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
    
    document.getElementById('totalAmount').textContent = total.toFixed(2).replace('.', ',');
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
    
    // Mostrar notificação de sucesso
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
    const dateFilter = document.getElementById('dateFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    // Implementar filtros aqui
    console.log('Filtros aplicados:', { dateFilter, statusFilter });
    loadSalesTable();
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        ">
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===============================
// SISTEMA DE MESAS
// ===============================

// Dados das mesas (já declarado no topo)

// Inicializar sistema de mesas
function initializeTablesSystem() {
    // Carregar mesas do localStorage ou criar mesas padrão
    loadTables();
    
    // Renderizar mesas
    renderTables();
    
    // Atualizar resumo
    updateTablesSummary();
    
    // Configurar eventos
    setupTablesEvents();
}

// Carregar mesas do storage
function loadTables() {
    const storedTables = localStorage.getItem('restaurantTables');
    
    if (storedTables) {
        tablesData = JSON.parse(storedTables);
    } else {
        // Criar mesas padrão
        tablesData = createDefaultTables();
        saveTables();
    }
}

// Criar mesas padrão
function createDefaultTables() {
    const defaultTables = [];
    
    // Criar 12 mesas padrão
    for (let i = 1; i <= 12; i++) {
        defaultTables.push({
            id: i,
            number: i,
            capacity: i <= 4 ? 4 : i <= 8 ? 6 : 8,
            status: 'available',
            customer: '',
            reservationTime: '',
            notes: '',
            occupiedSince: null,
            lastCleaning: null
        });
    }
    
    // Simular algumas mesas ocupadas para demonstração
    defaultTables[1].status = 'occupied';
    defaultTables[1].customer = 'João Silva';
    defaultTables[1].occupiedSince = new Date().getTime() - (45 * 60 * 1000); // 45 min atrás
    
    defaultTables[4].status = 'reserved';
    defaultTables[4].customer = 'Maria Santos';
    defaultTables[4].reservationTime = new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString().slice(0, 16);
    
    defaultTables[7].status = 'cleaning';
    
    return defaultTables;
}

// Salvar mesas no storage
function saveTables() {
    localStorage.setItem('restaurantTables', JSON.stringify(tablesData));
    
    // Também salvar no dataManager se existir
    if (window.dataManager) {
        window.dataManager.saveTables(tablesData);
    }
}

// Renderizar grid de mesas
function renderTables() {
    const container = document.getElementById('tablesGrid');
    if (!container) return;
    
    if (tablesData.length === 0) {
        container.innerHTML = `
            <div class="tables-empty">
                <i class="fas fa-chair"></i>
                <h3>Nenhuma mesa configurada</h3>
                <p>Clique em "Nova Mesa" para adicionar sua primeira mesa</p>
                <button class="btn-primary" onclick="addNewTable()">
                    <i class="fas fa-plus"></i> Adicionar Mesa
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = tablesData.map(table => createTableElement(table)).join('');
}

// Criar elemento HTML para uma mesa
function createTableElement(table) {
    const occupiedTime = table.occupiedSince ? formatOccupiedTime(table.occupiedSince) : '';
    
    return `
        <div class="table-item ${table.status}" onclick="openTableModal(${table.id})">
            ${table.customer ? `<div class="table-customer">${table.customer}</div>` : ''}
            ${occupiedTime ? `<div class="table-timer">${occupiedTime}</div>` : ''}
            
            <div class="table-number">${table.number}</div>
            <div class="table-capacity">
                <i class="fas fa-users"></i> ${table.capacity} pessoas
            </div>
            <div class="table-status ${table.status}">
                ${getStatusText(table.status)}
            </div>
        </div>
    `;
}

// Formatar tempo de ocupação
function formatOccupiedTime(occupiedSince) {
    const now = new Date().getTime();
    const diff = now - occupiedSince;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'available': 'Disponível',
        'occupied': 'Ocupada',
        'reserved': 'Reservada',
        'cleaning': 'Limpeza'
    };
    return statusMap[status] || status;
}

// Atualizar resumo das mesas
function updateTablesSummary() {
    const summary = tablesData.reduce((acc, table) => {
        acc[table.status] = (acc[table.status] || 0) + 1;
        return acc;
    }, {});
    
    document.getElementById('availableTablesCount').textContent = summary.available || 0;
    document.getElementById('occupiedTablesCount').textContent = summary.occupied || 0;
    document.getElementById('reservedTablesCount').textContent = summary.reserved || 0;
    document.getElementById('cleaningTablesCount').textContent = summary.cleaning || 0;
}

// Abrir modal da mesa
function openTableModal(tableId) {
    const table = tablesData.find(t => t.id === tableId);
    if (!table) return;
    
    // Preencher formulário
    document.getElementById('tableId').value = table.id;
    document.getElementById('tableNumber').value = table.number;
    document.getElementById('tableCapacity').value = table.capacity;
    document.getElementById('tableStatus').value = table.status;
    document.getElementById('customerName').value = table.customer || '';
    document.getElementById('reservationTime').value = table.reservationTime || '';
    document.getElementById('tableNotes').value = table.notes || '';
    
    // Atualizar título do modal
    document.getElementById('tableModalTitle').textContent = `Mesa ${table.number}`;
    
    // Mostrar/ocultar campos baseado no status
    toggleTableFormFields(table.status);
    
    // Mostrar botão de pedido se mesa ocupada
    const orderButton = document.getElementById('orderButton');
    if (table.status === 'occupied') {
        orderButton.style.display = 'inline-block';
        orderButton.onclick = () => openOrderForTable(table.id);
    } else {
        orderButton.style.display = 'none';
    }
    
    // Abrir modal
    openModal('tableModal');
}

// Alternar campos do formulário baseado no status
function toggleTableFormFields(status) {
    const customerGroup = document.getElementById('customerGroup');
    const reservationGroup = document.getElementById('reservationGroup');
    
    customerGroup.style.display = (status === 'occupied' || status === 'reserved') ? 'block' : 'none';
    reservationGroup.style.display = status === 'reserved' ? 'block' : 'none';
}

// Configurar eventos do sistema de mesas
function setupTablesEvents() {
    // Evento de mudança de status
    const statusSelect = document.getElementById('tableStatus');
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            toggleTableFormFields(this.value);
        });
    }
}

// Adicionar nova mesa
function addNewTable() {
    // Encontrar próximo número disponível
    const maxNumber = tablesData.reduce((max, table) => Math.max(max, table.number), 0);
    const nextNumber = maxNumber + 1;
    
    // Limpar formulário
    document.getElementById('tableForm').reset();
    document.getElementById('tableId').value = '';
    document.getElementById('tableNumber').value = nextNumber;
    document.getElementById('tableCapacity').value = '4';
    document.getElementById('tableStatus').value = 'available';
    
    // Atualizar título
    document.getElementById('tableModalTitle').textContent = 'Nova Mesa';
    
    // Ocultar campos extras
    toggleTableFormFields('available');
    
    // Ocultar botão de pedido
    document.getElementById('orderButton').style.display = 'none';
    
    // Abrir modal
    openModal('tableModal');
}

// Salvar mesa
function saveTable() {
    const form = document.getElementById('tableForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const tableId = document.getElementById('tableId').value;
    const tableData = {
        number: parseInt(document.getElementById('tableNumber').value),
        capacity: parseInt(document.getElementById('tableCapacity').value),
        status: document.getElementById('tableStatus').value,
        customer: document.getElementById('customerName').value,
        reservationTime: document.getElementById('reservationTime').value,
        notes: document.getElementById('tableNotes').value
    };
    
    if (tableId) {
        // Editar mesa existente
        const tableIndex = tablesData.findIndex(t => t.id == tableId);
        if (tableIndex > -1) {
            const oldTable = tablesData[tableIndex];
            tablesData[tableIndex] = {
                ...oldTable,
                ...tableData,
                occupiedSince: tableData.status === 'occupied' && oldTable.status !== 'occupied' 
                    ? new Date().getTime() : oldTable.occupiedSince
            };
        }
    } else {
        // Adicionar nova mesa
        const newId = Math.max(...tablesData.map(t => t.id), 0) + 1;
        tablesData.push({
            id: newId,
            ...tableData,
            occupiedSince: tableData.status === 'occupied' ? new Date().getTime() : null,
            lastCleaning: null
        });
    }
    
    // Salvar e atualizar
    saveTables();
    renderTables();
    updateTablesSummary();
    closeModal('tableModal');
    
    showNotification('Mesa salva com sucesso!', 'success');
}

// Atualizar mesas periodicamente
function refreshTables() {
    renderTables();
    updateTablesSummary();
    showNotification('Mesas atualizadas!', 'success');
}

// Abrir pedido para mesa
function openOrderForTable(tableId) {
    closeModal('tableModal');
    
    // Redirecionar para módulo de pedidos com mesa pré-selecionada
    showModule('pedidos');
    
    // Aguardar um pouco e pré-selecionar a mesa
    setTimeout(() => {
        const table = tablesData.find(t => t.id === tableId);
        if (table) {
            // Se existir campo de mesa nos pedidos, preencher
            const orderTableInput = document.getElementById('orderTable');
            if (orderTableInput) {
                orderTableInput.value = table.number;
            }
            
            // Abrir modal de novo pedido
            if (typeof openOrderModal === 'function') {
                openOrderModal();
            }
        }
    }, 500);
}

// Integrar ao sistema de módulos existente
const originalShowModule = window.showModule;
window.showModule = function(moduleName) {
    if (moduleName === 'mesas') {
        // Inicializar sistema de mesas se não foi inicializado
        if (tablesData.length === 0) {
            initializeTablesSystem();
        } else {
            renderTables();
            updateTablesSummary();
        }
    }
    
    // Chamar função original
    if (originalShowModule) {
        originalShowModule(moduleName);
    }
};

// ===============================
// SISTEMA DE PERMISSÕES
// ===============================

// Configurar interface do usuário
function setupUserInterface() {
    const user = window.authSystem ? window.authSystem.getCurrentUser() : null;
    if (!user) return;
    
    // Atualizar informações do usuário na interface
    const usernameElements = document.querySelectorAll('.username');
    usernameElements.forEach(element => {
        element.textContent = user.name || user.username;
    });
    
    const roleElements = document.querySelectorAll('.user-role');
    roleElements.forEach(element => {
        element.textContent = user.role;
    });
    
    // Adicionar badge de role se não existir
    const userInfo = document.querySelector('.user-info');
    if (userInfo && !userInfo.querySelector('.role-badge')) {
        const roleBadge = document.createElement('span');
        roleBadge.className = `role-badge ${user.role.toLowerCase()}`;
        roleBadge.textContent = user.role;
        userInfo.appendChild(roleBadge);
    }
}

// Aplicar permissões baseadas no usuário
function applyUserPermissions() {
    const user = window.authSystem ? window.authSystem.getCurrentUser() : null;
    if (!user) return;
    
    // Obter permissões do usuário
    const permissions = window.authSystem.getUserPermissions();
    
    // Aplicar restrições visuais
    document.querySelectorAll('[data-permission]').forEach(element => {
        const requiredPermission = element.dataset.permission;
        
        if (!permissions.includes(requiredPermission)) {
            element.style.display = 'none';
        }
    });
    
    // Desabilitar botões sem permissão
    document.querySelectorAll('[data-action]').forEach(button => {
        const action = button.dataset.action;
        
        if (!window.authSystem.canPerform(action)) {
            button.disabled = true;
            button.title = 'Você não tem permissão para esta ação';
            button.style.opacity = '0.5';
        }
    });
    
    // Personalizar sidebar baseado no role
    customizeSidebarForUser(user);
}

// Personalizar sidebar baseado no usuário
function customizeSidebarForUser(user) {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    
    sidebarItems.forEach(item => {
        const module = item.dataset.module;
        
        // Verificar se o usuário tem acesso ao módulo
        if (module && !window.authSystem.canAccess(module)) {
            item.style.display = 'none';
            return;
        }
        
        // Destacar módulos principais para cada role
        if (module && isMainModuleForRole(module, user.role)) {
            item.classList.add('main-module');
        }
    });
}

// Verificar se um módulo é principal para um role específico
function isMainModuleForRole(module, role) {
    const mainModules = {
        'admin': ['vendas', 'cardapio', 'estoque', 'pedidos', 'financeiro'],
        'manager': ['vendas', 'cardapio', 'estoque', 'pedidos', 'financeiro'],
        'waiter': ['vendas', 'pedidos'],
        'kitchen': ['pedidos', 'cardapio'],
        'cashier': ['vendas', 'financeiro'],
        'stock': ['estoque', 'cardapio']
    };
    
    return mainModules[role] && mainModules[role].includes(module);
}

// Verificar permissão antes de executar ação
function checkPermissionAndExecute(action, callback) {
    // Verificações mais flexíveis para compatibilidade
    if (!window.authSystem) {
        // Se o sistema de auth não estiver disponível, permitir ação (modo desenvolvimento)
        console.warn('Sistema de autenticação não disponível, executando ação');
        if (typeof callback === 'function') callback();
        return true;
    }
    
    // Verificar se o método existe antes de chamar
    if (typeof window.authSystem.canPerform === 'function') {
        if (!window.authSystem.canPerform(action)) {
            showAuthError('Você não tem permissão para esta ação');
            return false;
        }
    } else if (typeof window.authSystem.hasPermission === 'function') {
        if (!window.authSystem.hasPermission(action)) {
            showAuthError('Você não tem permissão para esta ação');
            return false;
        }
    }
    
    if (typeof callback === 'function') callback();
    return true;
}

// Função auxiliar para verificar se usuário pode acessar módulo
function canAccess(module) {
    if (!window.authSystem) return true; // Permitir acesso se auth não disponível
    
    if (typeof window.authSystem.canAccess === 'function') {
        return window.authSystem.canAccess(module);
    }
    
    if (typeof window.authSystem.hasPermission === 'function') {
        return window.authSystem.hasPermission(module);
    }
    
    return true; // Permitir acesso por padrão
}

// Função auxiliar para verificar se usuário pode realizar ação
function canPerform(action) {
    if (!window.authSystem) return true;
    
    if (typeof window.authSystem.canPerform === 'function') {
        return window.authSystem.canPerform(action);
    }
    
    if (typeof window.authSystem.hasPermission === 'function') {
        return window.authSystem.hasPermission(action);
    }
    
    return true;
}

// Mostrar erro de permissão
function showAuthError(message) {
    const notification = document.createElement('div');
    notification.className = 'auth-notification error';
    notification.innerHTML = `
        <i class="fas fa-shield-alt"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// Logout aprimorado
function logout() {
    const confirmLogout = confirm(`Tem certeza que deseja sair do sistema?\n\nTodos os dados não salvos serão perdidos.`);
    
    if (confirmLogout) {
        try {
            // Salvar dados importantes antes de sair
            if (typeof saveTables === 'function' && tablesData) {
                saveTables();
            }
            
            // Log de logout
            console.log('👋 Logout realizado:', new Date().toLocaleString());
            
            if (window.authSystem) {
                window.authSystem.logout();
            } else {
                // Fallback para método antigo
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('loginTime');
                localStorage.removeItem('maria_flor_session');
            }
            
            // Mostrar mensagem de despedida
            showNotification('Logout realizado com sucesso. Até logo!', 'info');
            
            // Redirecionar após um breve delay
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } catch (error) {
            console.error('Erro durante logout:', error);
            // Forçar logout mesmo com erro
            window.location.href = '../index.html';
        }
    }
}

// ===============================
// MÓDULO DE CARDÁPIO
// ===============================

function loadProducts() {
    if (!window.dataManager) return;
    
    const products = window.dataManager.getProducts();
    const grid = document.getElementById('productsGrid');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!grid) return;
    
    // Carregar categorias no filtro
    if (categoryFilter) {
        const categories = JSON.parse(localStorage.getItem('maria_flor_categories') || '[]');
        categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
        categories.forEach(cat => {
            categoryFilter.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
        });
    }
    
    // Renderizar produtos
    grid.innerHTML = '';
    
    products.forEach(product => {
        const stockStatus = product.stock > 20 ? 'high' : product.stock > 5 ? 'medium' : 'low';
        const stockText = product.stock > 20 ? 'Bom' : product.stock > 5 ? 'Médio' : 'Baixo';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-description">${product.description || ''}</div>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <div class="product-stock">
                    <span>Estoque:</span>
                    <span class="stock-indicator ${stockStatus}">${product.stock} - ${stockText}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-small" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small" onclick="toggleProductStatus(${product.id})" title="${product.active ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${product.active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn-small" onclick="deleteProduct(${product.id})" title="Excluir" style="background: #e74c3c; color: white;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Filtrar produtos (versão segura)
function safeFilterProducts() {
    try {
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';
        const search = document.getElementById('productSearch')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('productStatusFilter')?.value;
        
        const products = window.dataManager ? window.dataManager.getProducts() : [];
        const filteredProducts = products.filter(product => {
            const matchCategory = !categoryFilter || product.category === categoryFilter;
            const matchSearch = !search || product.name.toLowerCase().includes(search) || 
                               (product.description && product.description.toLowerCase().includes(search));
            const matchStatus = statusFilter === '' || product.active.toString() === statusFilter;
            
            return matchCategory && matchSearch && matchStatus;
        });
        
        // Re-render filtered products
        renderFilteredProducts(filteredProducts);
        
    } catch (error) {
        console.error('Erro ao filtrar produtos:', error);
        showNotification('Erro ao aplicar filtros', 'error');
    }
}

// Renderizar produtos filtrados
function renderFilteredProducts(filteredProducts) {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-products" style="text-align: center; padding: 40px;">
                <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 20px;"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Tente ajustar os filtros ou adicionar novos produtos</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const stockStatus = product.stock > 20 ? 'high' : product.stock > 5 ? 'medium' : 'low';
        const stockText = product.stock > 20 ? 'Bom' : product.stock > 5 ? 'Médio' : 'Baixo';
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '<i class="fas fa-utensils"></i>'}
            </div>
            <div class="product-info">
                <div class="product-name">${product.name}</div>
                <div class="product-category">${product.category}</div>
                <div class="product-description">${product.description || ''}</div>
                <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                <div class="product-stock">
                    <span>Estoque:</span>
                    <span class="stock-indicator ${stockStatus}">${product.stock} - ${stockText}</span>
                </div>
                <div class="product-actions">
                    <button class="btn-small" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-small" onclick="toggleProductStatus(${product.id})" title="${product.active ? 'Desativar' : 'Ativar'}">
                        <i class="fas fa-${product.active ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn-small btn-danger" onclick="deleteProduct(${product.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// Manter função original para compatibilidade
function filterProducts() {
    safeFilterProducts();
}

function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    const title = document.getElementById('productModalTitle');
    const categorySelect = document.getElementById('productCategory');
    
    if (!modal) return;
    
    // Carregar categorias
    const categories = JSON.parse(localStorage.getItem('maria_flor_categories') || '[]');
    categorySelect.innerHTML = '<option value="">Selecione uma categoria</option>';
    categories.forEach(cat => {
        categorySelect.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });
    
    if (productId) {
        // Editar produto
        title.textContent = 'Editar Produto';
        const products = window.dataManager.getProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productImage').value = product.image || '';
            
            form.dataset.productId = productId;
        }
    } else {
        // Novo produto
        title.textContent = 'Novo Produto';
        form.reset();
        delete form.dataset.productId;
    }
    
    modal.style.display = 'block';
}

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// ===============================
// MÓDULO DE ESTOQUE
// ===============================

function loadStock() {
    if (!window.dataManager) return;
    
    const products = window.dataManager.getProducts();
    const tbody = document.getElementById('stockTableBody');
    const alertsContainer = document.getElementById('stockAlerts');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Alertas de estoque baixo
    if (alertsContainer) {
        alertsContainer.innerHTML = '';
        
        const lowStockProducts = products.filter(p => p.stock <= 5);
        
        lowStockProducts.forEach(product => {
            const alertClass = product.stock === 0 ? 'critical' : '';
            const alertDiv = document.createElement('div');
            alertDiv.className = `stock-alert ${alertClass}`;
            alertDiv.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>${product.name}</strong> - 
                    Estoque ${product.stock === 0 ? 'zerado' : 'baixo'}: ${product.stock} unidades
                </div>
            `;
            alertsContainer.appendChild(alertDiv);
        });
    }
    
    // Tabela de estoque
    products.forEach(product => {
        const row = document.createElement('tr');
        const stockStatus = product.stock > 20 ? 'Alto' : product.stock > 5 ? 'Médio' : product.stock > 0 ? 'Baixo' : 'Zerado';
        const statusClass = product.stock > 20 ? 'success' : product.stock > 5 ? 'warning' : product.stock > 0 ? 'preparing' : 'cancelled';
        
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.stock}</td>
            <td>5</td>
            <td><span class="status ${statusClass}">${stockStatus}</span></td>
            <td>${new Date(product.updated_at || product.created_at).toLocaleString('pt-BR')}</td>
            <td>
                <button class="btn-small" onclick="openStockModal(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function openStockModal(productId = null) {
    const modal = document.getElementById('stockModal');
    const productSelect = document.getElementById('stockProduct');
    
    if (!modal) return;
    
    // Carregar produtos
    const products = window.dataManager.getProducts();
    productSelect.innerHTML = '<option value="">Selecione um produto</option>';
    products.forEach(product => {
        const selected = productId === product.id ? 'selected' : '';
        productSelect.innerHTML += `<option value="${product.id}" ${selected}>${product.name} (Atual: ${product.stock})</option>`;
    });
    
    modal.style.display = 'block';
}

function closeStockModal() {
    document.getElementById('stockModal').style.display = 'none';
}

// ===============================
// MÓDULO DE PEDIDOS
// ===============================

function loadOrders() {
    if (!window.dataManager) return;
    
    const orders = window.dataManager.getOrders();
    
    // Limpar colunas
    document.getElementById('pendingOrders').innerHTML = '';
    document.getElementById('preparingOrders').innerHTML = '';
    document.getElementById('readyOrders').innerHTML = '';
    document.getElementById('deliveredOrders').innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = createOrderCard(order);
        const containerId = `${order.status}Orders`;
        const container = document.getElementById(containerId);
        
        if (container) {
            container.appendChild(orderElement);
        }
    });
}

function createOrderCard(order) {
    const div = document.createElement('div');
    div.className = 'order-card';
    div.draggable = true;
    div.dataset.orderId = order.id;
    
    const itemsText = order.items ? order.items.map(item => `${item.name} (${item.quantity}x)`).join(', ') : '';
    const time = new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    div.innerHTML = `
        <div class="order-header">
            <span class="order-id">${order.id}</span>
            <span class="order-time">${time}</span>
        </div>
        <div class="order-table">Mesa: ${order.table_number || order.table || 'Balcão'}</div>
        <div class="order-items">${itemsText}</div>
        <div class="order-actions" style="margin-top: 10px;">
            ${getOrderActionButtons(order)}
        </div>
    `;
    
    return div;
}

function getOrderActionButtons(order) {
    const buttons = [];
    
    if (order.status === 'pending') {
        buttons.push(`<button class="btn-small" onclick="updateOrderStatus('${order.id}', 'preparing')" style="background: #f39c12; color: white;">Preparar</button>`);
    } else if (order.status === 'preparing') {
        buttons.push(`<button class="btn-small" onclick="updateOrderStatus('${order.id}', 'ready')" style="background: #27ae60; color: white;">Pronto</button>`);
    } else if (order.status === 'ready') {
        buttons.push(`<button class="btn-small" onclick="updateOrderStatus('${order.id}', 'delivered')" style="background: #3498db; color: white;">Entregar</button>`);
    }
    
    buttons.push(`<button class="btn-small" onclick="viewOrder('${order.id}')"><i class="fas fa-eye"></i></button>`);
    
    return buttons.join(' ');
}

function updateOrderStatus(orderId, newStatus) {
    if (window.dataManager) {
        window.dataManager.updateOrderStatus(orderId, newStatus);
        loadOrders();
        showNotification(`Pedido ${orderId} atualizado para: ${getStatusText(newStatus)}`, 'success');
    }
}

function getStatusText(status) {
    const statusTexts = {
        'pending': 'Pendente',
        'preparing': 'Preparando',
        'ready': 'Pronto',
        'delivered': 'Entregue'
    };
    return statusTexts[status] || status;
}

function openOrderModal() {
    document.getElementById('orderModal').style.display = 'block';
    addOrderItem(); // Adicionar primeiro item
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function addOrderItem() {
    const container = document.getElementById('orderItems');
    const products = window.dataManager ? window.dataManager.getProducts() : [];
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'order-item';
    itemDiv.innerHTML = `
        <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <select class="item-product" required style="flex: 2;">
                <option value="">Selecione um produto</option>
                ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.name} - R$ ${p.price.toFixed(2)}</option>`).join('')}
            </select>
            <input type="number" class="item-quantity" min="1" value="1" required style="width: 80px;">
            <button type="button" onclick="removeOrderItem(this)" class="btn-small" style="background: #e74c3c; color: white;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

function removeOrderItem(button) {
    const container = document.getElementById('orderItems');
    if (container.children.length > 1) {
        button.closest('.order-item').remove();
    }
}

// ===============================
// MÓDULO FINANCEIRO
// ===============================

function loadFinancialData() {
    if (!window.dataManager) return;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    
    const sales = window.dataManager.getSales();
    const expenses = JSON.parse(localStorage.getItem('maria_flor_expenses') || '[]');
    
    // Filtrar por mês atual
    const monthlySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return saleDate >= startDate && saleDate <= endDate;
    });
    
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
    });
    
    // Calcular totais
    const totalRevenue = monthlySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    // Atualizar cards
    document.getElementById('totalRevenue').textContent = `R$ ${totalRevenue.toFixed(2).replace('.', ',')}`;
    document.getElementById('totalExpenses').textContent = `R$ ${totalExpenses.toFixed(2).replace('.', ',')}`;
    document.getElementById('netProfit').textContent = `R$ ${netProfit.toFixed(2).replace('.', ',')}`;
    
    // Atualizar cor do lucro
    const profitElement = document.getElementById('netProfit');
    profitElement.style.color = netProfit >= 0 ? '#27ae60' : '#e74c3c';
    
    // Gráfico financeiro
    loadFinancialChart(monthlySales, monthlyExpenses);
    loadPaymentMethodsChart(monthlySales);
}

function loadFinancialChart(sales, expenses) {
    const ctx = document.getElementById('financialChart');
    if (!ctx) return;
    
    // Agrupar por dia
    const dailyData = {};
    
    sales.forEach(sale => {
        const day = new Date(sale.date).toLocaleDateString('pt-BR');
        if (!dailyData[day]) {
            dailyData[day] = { revenue: 0, expenses: 0 };
        }
        dailyData[day].revenue += sale.total;
    });
    
    expenses.forEach(expense => {
        const day = new Date(expense.date).toLocaleDateString('pt-BR');
        if (!dailyData[day]) {
            dailyData[day] = { revenue: 0, expenses: 0 };
        }
        dailyData[day].expenses += expense.amount;
    });
    
    const labels = Object.keys(dailyData).sort();
    const revenueData = labels.map(day => dailyData[day].revenue);
    const expensesData = labels.map(day => dailyData[day].expenses);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Receitas',
                data: revenueData,
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                fill: true
            }, {
                label: 'Despesas',
                data: expensesData,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                fill: true
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
                            return 'R$ ' + value.toFixed(0);
                        }
                    }
                }
            }
        }
    });
}

function loadPaymentMethodsChart(sales) {
    const ctx = document.getElementById('paymentMethodsChart');
    if (!ctx) return;
    
    const paymentMethods = {};
    
    sales.forEach(sale => {
        const method = sale.paymentMethod;
        if (!paymentMethods[method]) {
            paymentMethods[method] = 0;
        }
        paymentMethods[method] += sale.total;
    });
    
    const labels = Object.keys(paymentMethods).map(method => {
        const methodNames = {
            'cash': 'Dinheiro',
            'card': 'Cartão',
            'pix': 'PIX'
        };
        return methodNames[method] || method;
    });
    
    const data = Object.values(paymentMethods);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#3498db', '#9b59b6', '#e67e22']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function openExpenseModal() {
    const modal = document.getElementById('expenseModal');
    document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
    modal.style.display = 'block';
}

function closeExpenseModal() {
    document.getElementById('expenseModal').style.display = 'none';
}

function generateFinancialReport() {
    showNotification('Relatório financeiro gerado com sucesso!', 'success');
    // Aqui você pode implementar a geração de PDF ou exportação
}

// ===============================
// EVENT LISTENERS PARA FORMULÁRIOS
// ===============================

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Event listeners para os formulários dos módulos
    
    // Formulário de produto
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDescription').value,
                price: parseFloat(document.getElementById('productPrice').value),
                category: document.getElementById('productCategory').value,
                stock: parseInt(document.getElementById('productStock').value) || 0,
                image: document.getElementById('productImage').value,
                active: true
            };
            
            if (e.target.dataset.productId) {
                formData.id = parseInt(e.target.dataset.productId);
            }
            
            if (window.dataManager) {
                window.dataManager.saveProduct(formData);
                showNotification('Produto salvo com sucesso!', 'success');
                closeProductModal();
                if (currentPage === 'cardapio') {
                    loadProducts();
                }
            }
        });
    }
    
    // Formulário de pedido
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const items = [];
            document.querySelectorAll('.order-item').forEach(itemDiv => {
                const productSelect = itemDiv.querySelector('.item-product');
                const quantity = parseInt(itemDiv.querySelector('.item-quantity').value);
                
                if (productSelect.value && quantity > 0) {
                    const option = productSelect.selectedOptions[0];
                    items.push({
                        productId: parseInt(productSelect.value),
                        name: option.text.split(' - ')[0],
                        quantity: quantity
                    });
                }
            });
            
            if (items.length === 0) {
                alert('Adicione pelo menos um item ao pedido!');
                return;
            }
            
            const orderData = {
                table_number: parseInt(document.getElementById('orderTable').value),
                priority: parseInt(document.getElementById('orderPriority').value),
                status: 'pending',
                notes: document.getElementById('orderNotes').value,
                items: items
            };
            
            if (window.dataManager) {
                window.dataManager.saveOrder(orderData);
                showNotification('Pedido criado com sucesso!', 'success');
                closeOrderModal();
                if (currentPage === 'pedidos') {
                    loadOrders();
                }
            }
        });
    }
    
    // Formulário de estoque
    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const productId = parseInt(document.getElementById('stockProduct').value);
            const type = document.getElementById('stockType').value;
            const quantity = parseInt(document.getElementById('stockQuantity').value);
            const reason = document.getElementById('stockReason').value;
            const notes = document.getElementById('stockNotes').value;
            
            // Atualizar estoque do produto
            const products = window.dataManager.getProducts();
            const productIndex = products.findIndex(p => p.id === productId);
            
            if (productIndex >= 0) {
                const product = products[productIndex];
                
                if (type === 'in') {
                    product.stock += quantity;
                } else if (type === 'out') {
                    product.stock = Math.max(0, product.stock - quantity);
                } else if (type === 'adjustment') {
                    product.stock = quantity;
                }
                
                product.updated_at = new Date().toISOString();
                
                localStorage.setItem('maria_flor_products', JSON.stringify(products));
                
                showNotification('Estoque atualizado com sucesso!', 'success');
                closeStockModal();
                if (currentPage === 'estoque') {
                    loadStock();
                }
            }
        });
    }
    
    // Formulário de despesa
    const expenseForm = document.getElementById('expenseForm');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const expenseData = {
                id: Date.now(),
                description: document.getElementById('expenseDescription').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                category: document.getElementById('expenseCategory').value,
                date: document.getElementById('expenseDate').value,
                paymentMethod: document.getElementById('expensePayment').value,
                created_at: new Date().toISOString()
            };
            
            const expenses = JSON.parse(localStorage.getItem('maria_flor_expenses') || '[]');
            expenses.push(expenseData);
            localStorage.setItem('maria_flor_expenses', JSON.stringify(expenses));
            
            showNotification('Despesa registrada com sucesso!', 'success');
            closeExpenseModal();
            if (currentPage === 'financeiro') {
                loadFinancialData();
            }
        });
    }
});

// Atualizar navegação para carregar dados dos módulos
const originalNavigateToPage = navigateToPage;
navigateToPage = function(page) {
    originalNavigateToPage(page);
    
    // Carregar dados específicos de cada módulo
    setTimeout(() => {
        switch(page) {
            case 'cardapio':
                loadProducts();
                break;
            case 'estoque':
                loadStock();
                break;
            case 'pedidos':
                loadOrders();
                break;
            case 'financeiro':
                loadFinancialData();
                break;
        }
    }, 100);
};

// ===============================
// FUNÇÕES AUXILIARES DOS MODAIS
// ===============================

// Função genérica para abrir modais
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        modal.classList.add('show');
        
        // Adicionar backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.onclick = () => closeModal(modalId);
        document.body.appendChild(backdrop);
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
    }
}

// Função genérica para fechar modais
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        
        // Remover backdrop
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
    }
}

// ===============================
// FUNÇÕES DOS BOTÕES DA TABELA DE VENDAS
// ===============================

// Visualizar detalhes da venda (melhorada)
function viewSale(saleId) {
    const sale = salesData.find(s => s.id === saleId);
    if (!sale) {
        showNotification('Venda não encontrada!', 'error');
        return;
    }
    
    const date = new Date(sale.date);
    const itemsList = sale.items.map(item => 
        `• ${item.name} - Qtd: ${item.quantity} - R$ ${item.price.toFixed(2)}`
    ).join('\n');
    
    const paymentMethods = {
        cash: 'Dinheiro',
        card: 'Cartão',
        pix: 'PIX'
    };
    
    const details = `
📋 DETALHES DA VENDA ${saleId}

👤 Cliente: ${sale.customer}
📅 Data: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}

🛒 Itens:
${itemsList}

💰 Total: R$ ${sale.total.toFixed(2)}
💳 Pagamento: ${paymentMethods[sale.paymentMethod]}
📊 Status: ${sale.status}
    `;
    
    alert(details);
}

// Editar venda (implementada)
function editSale(saleId) {
    const sale = salesData.find(s => s.id === saleId);
    if (!sale) {
        showNotification('Venda não encontrada!', 'error');
        return;
    }
    
    // Abrir modal de venda com dados preenchidos
    openSaleModal();
    
    // Preencher formulário
    document.getElementById('customerName').value = sale.customer;
    document.getElementById('paymentMethod').value = sale.paymentMethod;
    
    // Limpar itens existentes e adicionar os da venda
    document.getElementById('saleItems').innerHTML = '';
    
    sale.items.forEach((item, index) => {
        addItem();
        const saleItems = document.querySelectorAll('.sale-item');
        const lastItem = saleItems[saleItems.length - 1];
        
        lastItem.querySelector('.item-name').value = item.name;
        lastItem.querySelector('.item-price').value = item.price;
        lastItem.querySelector('.item-quantity').value = item.quantity;
    });
    
    calculateTotal();
    
    // Marcar como edição
    document.getElementById('saleForm').dataset.editingId = saleId;
    
    showNotification('Dados da venda carregados para edição', 'info');
}

// ===============================
// FUNÇÕES DOS BOTÕES DO CARDÁPIO
// ===============================

// Editar produto
function editProduct(productId) {
    if (!checkPermissionAndExecute('menu-edit', () => {})) return;
    
    openProductModal(productId);
}

// Alternar status do produto (ativar/desativar)
function toggleProductStatus(productId) {
    if (!checkPermissionAndExecute('menu-edit', () => {})) return;
    
    const products = window.dataManager ? window.dataManager.getProducts() : [];
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex >= 0) {
        products[productIndex].active = !products[productIndex].active;
        products[productIndex].updated_at = new Date().toISOString();
        
        localStorage.setItem('maria_flor_products', JSON.stringify(products));
        
        const status = products[productIndex].active ? 'ativado' : 'desativado';
        showNotification(`Produto ${status} com sucesso!`, 'success');
        
        if (currentPage === 'cardapio') {
            loadProducts();
        }
    } else {
        showNotification('Produto não encontrado!', 'error');
    }
}

// Excluir produto
function deleteProduct(productId) {
    if (!checkPermissionAndExecute('menu-delete', () => {})) return;
    
    const products = window.dataManager ? window.dataManager.getProducts() : [];
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Produto não encontrado!', 'error');
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        if (window.dataManager) {
            window.dataManager.deleteProduct(productId);
            showNotification('Produto excluído com sucesso!', 'success');
            
            if (currentPage === 'cardapio') {
                loadProducts();
            }
        }
    }
}

// ===============================
// FUNÇÕES DOS BOTÕES DE PEDIDOS
// ===============================

// Visualizar pedidos recentes no dashboard
function viewRecentOrder(orderId) {
    // Dados mockados dos pedidos recentes
    const recentOrders = {
        '#001': {
            id: '#001',
            customer: 'João Silva',
            items: ['Hambúrguer', 'Batata Frita'],
            total: 35.00,
            status: 'Preparando',
            table: '5',
            time: '14:30'
        },
        '#002': {
            id: '#002', 
            customer: 'Maria Santos',
            items: ['Pizza Margherita'],
            total: 45.00,
            status: 'Pronto',
            table: '2',
            time: '14:15'
        },
        '#003': {
            id: '#003',
            customer: 'Carlos Oliveira', 
            items: ['Salada Caesar', 'Suco'],
            total: 28.00,
            status: 'Entregue',
            table: '8', 
            time: '14:00'
        }
    };
    
    const order = recentOrders[orderId];
    if (!order) {
        showNotification('Pedido não encontrado!', 'error');
        return;
    }
    
    const details = `
📋 DETALHES DO PEDIDO ${order.id}

👤 Cliente: ${order.customer}
🏪 Mesa: ${order.table}
🕐 Horário: ${order.time}

🍽️ Itens:
${order.items.map(item => `• ${item}`).join('\n')}

💰 Total: R$ ${order.total.toFixed(2)}
📊 Status: ${order.status}
    `;
    
    alert(details);
}

// Editar pedidos recentes
function editRecentOrder(orderId) {
    showNotification('Redirecionando para o módulo de pedidos...', 'info');
    
    // Navegar para módulo de pedidos
    navigateToPage('pedidos');
    
    // Simular busca pelo pedido após navegação
    setTimeout(() => {
        showNotification(`Procurando pedido ${orderId} no sistema...`, 'info');
    }, 500);
}

// Visualizar detalhes do pedido
function viewOrder(orderId) {
    const orders = window.dataManager ? window.dataManager.getOrders() : [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Pedido não encontrado!', 'error');
        return;
    }
    
    const date = new Date(order.created_at);
    const itemsList = order.items ? order.items.map(item => 
        `• ${item.name} - Qtd: ${item.quantity}`
    ).join('\n') : 'Nenhum item';
    
    const statusTexts = {
        'pending': 'Pendente',
        'preparing': 'Preparando',
        'ready': 'Pronto',
        'delivered': 'Entregue'
    };
    
    const details = `
📋 DETALHES DO PEDIDO ${orderId}

🏪 Mesa: ${order.table_number || order.table || 'Balcão'}
📅 Criado: ${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR')}

🍽️ Itens:
${itemsList}

📊 Status: ${statusTexts[order.status]}
🔥 Prioridade: ${order.priority === 3 ? 'Urgente' : order.priority === 2 ? 'Alta' : 'Normal'}
${order.notes ? `\n📝 Observações: ${order.notes}` : ''}
    `;
    
    alert(details);
}

// ===============================
// APRIMORAMENTOS DOS MODAIS EXISTENTES
// ===============================

// Aprimorar função de adicionar item na venda
const originalAddItem = addItem;
addItem = function() {
    itemCounter++;
    const itemsContainer = document.getElementById('saleItems');
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'sale-item';
    itemDiv.innerHTML = `
        <div class="item-row">
            <input type="text" placeholder="Nome do produto" class="item-name" required>
            <input type="number" placeholder="Preço" class="item-price" step="0.01" min="0" required onchange="calculateTotal()">
            <input type="number" placeholder="Qtd" class="item-quantity" min="1" value="1" required onchange="calculateTotal()">
            <button type="button" onclick="removeItem(this)" class="btn-small btn-danger" title="Remover item">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    itemsContainer.appendChild(itemDiv);
    
    // Focar no primeiro campo do novo item
    itemDiv.querySelector('.item-name').focus();
};

// Melhorar remoção de item
const originalRemoveItem = removeItem;
removeItem = function(button) {
    const itemsContainer = document.getElementById('saleItems');
    if (itemsContainer.children.length > 1) {
        button.closest('.sale-item').remove();
        calculateTotal();
        showNotification('Item removido', 'info');
    } else {
        showNotification('Deve haver pelo menos um item', 'warning');
    }
};

// Aprimorar submit da venda para lidar com edição
const originalSubmitSale = submitSale;
submitSale = function(e) {
    e.preventDefault();
    
    const editingId = document.getElementById('saleForm').dataset.editingId;
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
        showNotification('Adicione pelo menos um item à venda!', 'warning');
        return;
    }
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (editingId) {
        // Editar venda existente
        const saleIndex = salesData.findIndex(s => s.id === editingId);
        if (saleIndex >= 0) {
            salesData[saleIndex] = {
                ...salesData[saleIndex],
                customer: customerName,
                items: items,
                total: total,
                paymentMethod: paymentMethod,
                updated_at: new Date().toISOString()
            };
            
            showNotification('Venda atualizada com sucesso!', 'success');
        }
        
        // Limpar flag de edição
        delete document.getElementById('saleForm').dataset.editingId;
        
    } else {
        // Nova venda
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
        showNotification('Venda registrada com sucesso!', 'success');
    }
    
    localStorage.setItem('salesData', JSON.stringify(salesData));
    
    closeSaleModal();
    
    if (currentPage === 'vendas') {
        loadSalesTable();
    }
};

// ===============================
// NOTIFICAÇÕES APRIMORADAS
// ===============================

// Função de notificação melhorada
const originalShowNotification = showNotification;
showNotification = function(message, type = 'info') {
    // Remover notificações existentes
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle', 
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            max-width: 400px;
        ">
            <i class="fas fa-${icons[type]}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 18px;
                margin-left: 10px;
            ">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
};

// ===============================
// ESTILOS CSS ADICIONAIS
// ===============================

// Animações e estilos para notificações
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .item-row {
        display: flex;
        gap: 10px;
        margin-bottom: 10px;
        align-items: center;
    }
    
    .item-row input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
    }
    
    .item-row .item-name { flex: 2; }
    .item-row .item-price { flex: 1; }
    .item-row .item-quantity { width: 80px; }
    
    .btn-danger {
        background-color: #e74c3c;
        color: white;
    }
    
    .btn-danger:hover {
        background-color: #c0392b;
    }
    
    .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
    }
    
    .modal.show {
        animation: fadeIn 0.3s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    .no-products {
        text-align: center;
        padding: 40px;
        color: #666;
    }
    
    .no-products i {
        font-size: 48px;
        color: #ccc;
        margin-bottom: 20px;
        display: block;
    }
`;
document.head.appendChild(notificationStyle);

// ===============================
// INICIALIZAÇÃO FINAL E VALIDAÇÃO
// ===============================

// Validar sistema após carregamento
function validateSystemButtons() {
    const criticalButtons = [
        'logout()', 'openSaleModal()', 'addNewTable()', 'saveTable()',
        'openProductModal()', 'openOrderModal()', 'openStockModal()',
        'openExpenseModal()', 'filterSales()', 'refreshTables()'
    ];
    
    const missingFunctions = [];
    
    criticalButtons.forEach(btnFunction => {
        const functionName = btnFunction.replace('()', '');
        if (typeof window[functionName] !== 'function') {
            missingFunctions.push(functionName);
        }
    });
    
    if (missingFunctions.length > 0) {
        console.warn('⚠️ Funções não implementadas:', missingFunctions);
    } else {
        console.log('✅ Todos os botões principais estão implementados');
    }
    
    return missingFunctions.length === 0;
}

// Funcionalidades extras que podem estar faltando
function setupExtraFeatures() {
    // Atalhos de teclado
    document.addEventListener('keydown', function(e) {
        // Ctrl+S para salvar (prevenir comportamento padrão do browser)
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            showNotification('Dados salvos automaticamente', 'info');
        }
        
        // Esc para fechar modais
        if (e.key === 'Escape') {
            closeAllModals();
        }
        
        // F5 para atualizar dados
        if (e.key === 'F5') {
            e.preventDefault();
            refreshAllData();
        }
    });
    
    // Auto-save a cada 30 segundos
    setInterval(() => {
        if (typeof autoSaveData === 'function') {
            autoSaveData();
        }
    }, 30000);
    
    // Verificação de conectividade
    window.addEventListener('online', () => {
        showNotification('Conexão restaurada', 'success');
    });
    
    window.addEventListener('offline', () => {
        showNotification('Sistema funcionando offline', 'warning');
    });
}

// Fechar todos os modais
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });
    
    // Remover backdrops
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.remove();
    });
    
    // Restaurar scroll
    document.body.style.overflow = '';
}

// Atualizar todos os dados
function refreshAllData() {
    try {
        showNotification('Atualizando dados...', 'info');
        
        if (currentPage === 'vendas') {
            loadSalesTable();
        } else if (currentPage === 'mesas') {
            refreshTables();
        } else if (currentPage === 'cardapio') {
            loadProducts();
        } else if (currentPage === 'pedidos') {
            loadOrders();
        } else if (currentPage === 'estoque') {
            loadStock();
        } else if (currentPage === 'financeiro') {
            loadFinancialData();
        }
        
        setTimeout(() => {
            showNotification('Dados atualizados!', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
        showNotification('Erro ao atualizar alguns dados', 'warning');
    }
}

// Auto-save dos dados importantes
function autoSaveData() {
    try {
        if (tablesData && tablesData.length > 0) {
            localStorage.setItem('restaurantTables', JSON.stringify(tablesData));
        }
        
        if (salesData && salesData.length > 0) {
            localStorage.setItem('salesData', JSON.stringify(salesData));
        }
        
        // Log silencioso do auto-save
        console.log('💾 Auto-save realizado:', new Date().toLocaleTimeString());
        
    } catch (error) {
        console.error('Erro no auto-save:', error);
    }
}

// Configuração avançada após inicialização
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        setupExtraFeatures();
        validateSystemButtons();
        
        // Mostrar dicas para usuários novos
        if (!localStorage.getItem('maria_flor_tips_shown')) {
            setTimeout(() => {
                showSystemTips();
                localStorage.setItem('maria_flor_tips_shown', 'true');
            }, 2000);
        }
    }, 1000);
});

// Mostrar dicas do sistema
function showSystemTips() {
    const user = window.authSystem ? window.authSystem.getCurrentUser() : null;
    const userName = user ? user.name : 'Usuário';
    
    showNotification(`Bem-vindo(a) ao Sistema Maria Flor, ${userName}! 🎉`, 'success');
    
    setTimeout(() => {
        showNotification('💡 Dica: Use Esc para fechar modais e F5 para atualizar dados', 'info');
    }, 3000);
}