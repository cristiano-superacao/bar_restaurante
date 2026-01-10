document.addEventListener('DOMContentLoaded', function () {
    const apiEnabled = typeof window !== 'undefined' && window.API && window.API.enabled;
    const STORE = (typeof window !== 'undefined' && window.APP_STORAGE)
        ? window.APP_STORAGE
        : {
            get: (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (def ?? null); } catch { return def ?? null; } },
        };

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
                orders = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
                menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
            }
        } else {
            orders = STORE.get('pedidos', [], ['pedidos', 'orders']) || [];
            menuItems = STORE.get('menuItems', [], ['menuItems']) || [];
        }
    }

    // --- Elementos do DOM ---
    const totalSalesValueEl = document.getElementById('total-sales-value');
    const totalOrdersCountEl = document.getElementById('total-orders-count');
    const summaryTotalSalesEl = document.getElementById('summary-total-sales');
    const summaryTotalOrdersEl = document.getElementById('summary-total-orders');
    const periodFilterEl = document.getElementById('reports-period-filter');
    const emptyEl = document.getElementById('reports-empty');
    const topItemsChartCanvas = document.getElementById('top-items-chart');
    const salesByCategoryChartCanvas = document.getElementById('sales-by-category-chart');
    let topItemsChart = null;
    let salesByCategoryChart = null;

    // --- Funções de Cálculo ---

    function isPaidOrder(order) {
        const st = order && order.status ? String(order.status) : '';
        if (st === 'Pago') return true;
        // Legado: alguns fluxos antigos marcavam como Entregue sem pagamento
        if (st === 'Entregue' && !order.paidAt && !order.paid_at) return true;
        return false;
    }

    // Calcula o valor total de vendas
    function calculateTotalSales(data) {
        return data.reduce((total, order) => total + (order.total || 0), 0);
    }

    // Conta o número total de pedidos
    function countTotalOrders(data) {
        return data.length;
    }

    // Analisa os itens mais vendidos
    function getTopSellingItems(data) {
        const itemCounts = {};
        data.forEach(order => {
            (order.items || []).forEach(item => {
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
    function getSalesByCategory(data) {
        const categorySales = {};
        data.forEach(order => {
            (order.items || []).forEach(orderItem => {
                const menuItem = menuItems.find(mi => String(mi.id) === String(orderItem.id));
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

    function filterOrdersByPeriod(period) {
        if (!period || period === 'all') return orders;
        const now = new Date();
        const start = new Date(now);
        if (period === 'hoje') {
            start.setHours(0, 0, 0, 0);
        } else if (period === 'semana') {
            start.setDate(now.getDate() - 7);
        } else if (period === 'mes') {
            start.setDate(now.getDate() - 30);
        } else {
            return orders;
        }
        return orders.filter(o => {
            const d = o.data || o.createdAt || o.date;
            if (!d) return true; // se não houver data, considerar no conjunto
            const od = new Date(d);
            if (period === 'hoje') return od.toDateString() === now.toDateString();
            return od >= start && od <= now;
        });
    }

    // --- Funções de Renderização ---

    function renderSummaryCards(data) {
        const totalSales = calculateTotalSales(data);
        const totalOrders = countTotalOrders(data);
        const formatted = `R$ ${totalSales.toFixed(2).replace('.', ',')}`;
        if (totalSalesValueEl) totalSalesValueEl.textContent = formatted;
        if (totalOrdersCountEl) totalOrdersCountEl.textContent = totalOrders;
        if (summaryTotalSalesEl) summaryTotalSalesEl.textContent = formatted;
        if (summaryTotalOrdersEl) summaryTotalOrdersEl.textContent = totalOrders;
    }

    function renderTopItemsChart(data) {
        const topItems = getTopSellingItems(data);
        const labels = topItems.map(item => item[0]);
        const values = topItems.map(item => item[1]);

        if (!topItemsChartCanvas || typeof Chart === 'undefined') return;

        if (topItemsChart) topItemsChart.destroy();
        topItemsChart = new Chart(topItemsChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Quantidade Vendida',
                    data: values,
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

    function renderSalesByCategoryChart(data) {
        const categorySales = getSalesByCategory(data);
        const labels = categorySales.map(cat => cat[0]);
        const values = categorySales.map(cat => cat[1]);

        if (!salesByCategoryChartCanvas || typeof Chart === 'undefined') return;

        if (salesByCategoryChart) salesByCategoryChart.destroy();
        salesByCategoryChart = new Chart(salesByCategoryChartCanvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas por Categoria',
                    data: values,
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
    function renderAll() {
        const period = periodFilterEl ? periodFilterEl.value : 'all';
        const scoped = filterOrdersByPeriod(period);
        const data = (scoped || []).filter(isPaidOrder);
        const hasData = data.length > 0;
        if (emptyEl) emptyEl.style.display = hasData ? 'none' : 'flex';
        renderSummaryCards(data);
        if (hasData) {
            renderTopItemsChart(data);
            renderSalesByCategoryChart(data);
        }
    }

    (async () => {
        await loadData();
        renderAll();
    })();

    if (periodFilterEl) periodFilterEl.addEventListener('change', renderAll);
});
