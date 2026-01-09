document.addEventListener('DOMContentLoaded', function () {
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;

    // --- Carregar Dados ---
    let orders = [];
    let menuItems = [];
    async function loadData() {
        if (apiEnabled && window.API) {
            try {
                const [o, m] = await Promise.all([
                    window.API.orders.listWithItems(),
                    window.API.menu.list()
                ]);
                orders = o || [];
                menuItems = m || [];
            } catch (e) {
                console.warn('Falha ao carregar dados da API, usando LocalStorage.', e);
                orders = JSON.parse(localStorage.getItem('pedidos')) || JSON.parse(localStorage.getItem('orders')) || [];
                menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
            }
        } else {
            orders = JSON.parse(localStorage.getItem('pedidos')) || JSON.parse(localStorage.getItem('orders')) || [];
            menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
        }
    }

    // --- Elementos do DOM ---
    const totalSalesValueEl = document.getElementById('total-sales-value');
    const totalOrdersCountEl = document.getElementById('total-orders-count');
    const topItemsChartCanvas = document.getElementById('top-items-chart');
    const salesByCategoryChartCanvas = document.getElementById('sales-by-category-chart');

    // --- Funções de Cálculo ---

    // Calcula o valor total de vendas
    function calculateTotalSales() {
        return orders.reduce((total, order) => total + order.total, 0);
    }

    // Conta o número total de pedidos
    function countTotalOrders() {
        return orders.length;
    }

    // Analisa os itens mais vendidos
    function getTopSellingItems() {
        const itemCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (itemCounts[item.name]) {
                    itemCounts[item.name] += item.quantity;
                } else {
                    itemCounts[item.name] = item.quantity;
                }
            });
        });

        return Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5 itens
    }

    // Analisa as vendas por categoria
    function getSalesByCategory() {
        const categorySales = {};
        orders.forEach(order => {
            order.items.forEach(orderItem => {
                const menuItem = menuItems.find(mi => mi.id === orderItem.id);
                if (menuItem) {
                    const category = menuItem.category;
                    if (categorySales[category]) {
                        categorySales[category] += orderItem.price * orderItem.quantity;
                    } else {
                        categorySales[category] = orderItem.price * orderItem.quantity;
                    }
                }
            });
        });
        return Object.entries(categorySales);
    }

    // --- Funções de Renderização ---

    function renderSummaryCards() {
        totalSalesValueEl.textContent = `R$ ${calculateTotalSales().toFixed(2).replace('.', ',')}`;
        totalOrdersCountEl.textContent = countTotalOrders();
    }

    function renderTopItemsChart() {
        const topItems = getTopSellingItems();
        const labels = topItems.map(item => item[0]);
        const data = topItems.map(item => item[1]);

        new Chart(topItemsChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
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

    function renderSalesByCategoryChart() {
        const categorySales = getSalesByCategory();
        const labels = categorySales.map(cat => cat[0]);
        const data = categorySales.map(cat => cat[1]);

        new Chart(salesByCategoryChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas por Categoria',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                    ],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }

    // --- Inicialização ---
    if (totalSalesValueEl && totalOrdersCountEl && topItemsChartCanvas && salesByCategoryChartCanvas) {
        (async () => {
            await loadData();
            renderSummaryCards();
            renderTopItemsChart();
            renderSalesByCategoryChart();
        })();
    }
});