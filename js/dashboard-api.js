/**
 * Dashboard API Integration - Maria Flor
 * Conecta o dashboard existente com as APIs do servidor
 */

class DashboardAPI {
    constructor() {
        this.apiUrl = '/.netlify/functions/api-complete';
        this.authToken = localStorage.getItem('authToken');
        this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.init();
    }

    init() {
        console.log('🔗 Conectando Dashboard com APIs');
        
        if (!this.authToken) {
            console.log('❌ Token não encontrado, redirecionando...');
            window.location.href = '../index.html';
            return;
        }

        // Aguardar DOM carregar e conectar com sistema existente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.connectToExistingSystem());
        } else {
            this.connectToExistingSystem();
        }
    }

    connectToExistingSystem() {
        console.log('🔌 Conectando com sistema existente...');
        
        // Interceptar carregamento de dados existente
        this.overrideDashboardFunctions();
        
        // Carregar dados reais da API
        this.loadRealData();
        
        // Configurar atualizações automáticas
        setInterval(() => this.loadRealData(), 30000); // 30s
    }

    overrideDashboardFunctions() {
        // Interceptar função de carregamento de vendas se existir
        if (window.loadSalesData) {
            const originalLoadSales = window.loadSalesData;
            window.loadSalesData = () => {
                console.log('🔄 Carregando vendas via API...');
                this.loadSalesFromAPI();
            };
        }

        // Interceptar carregamento de dashboard
        if (window.loadDashboardData) {
            const originalLoadDashboard = window.loadDashboardData;
            window.loadDashboardData = () => {
                console.log('🔄 Carregando dashboard via API...');
                this.loadDashboardFromAPI();
            };
        }
    }

    async loadRealData() {
        try {
            await this.loadDashboardFromAPI();
            await this.loadMenuFromAPI();
            await this.loadTablesFromAPI();
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }

    async loadDashboardFromAPI() {
        try {
            console.log('📊 Carregando dados do dashboard...');
            
            const response = await fetch(`${this.apiUrl}/dashboard`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                this.updateDashboardUI(result.data);
                console.log('✅ Dashboard atualizado com dados da API');
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            console.error('❌ Erro na API do dashboard:', error);
            this.updateDashboardUI(this.getMockData());
        }
    }

    updateDashboardUI(data) {
        // Atualizar cards de estatísticas
        this.updateElement('vendas-hoje-total', this.formatCurrency(data.vendas_hoje?.total || 0));
        this.updateElement('vendas-hoje-qtd', data.vendas_hoje?.quantidade || 0);
        this.updateElement('pedidos-ativos', data.pedidos_ativos || 0);
        this.updateElement('mesas-ocupadas', data.mesas_ocupadas || 0);
        this.updateElement('estoque-baixo', data.estoque_baixo || 0);

        // Tentar atualizar elementos com IDs alternativos
        this.updateElement('totalVendas', this.formatCurrency(data.vendas_hoje?.total || 0));
        this.updateElement('totalPedidos', data.pedidos_ativos || 0);
        this.updateElement('mesasOcupadas', data.mesas_ocupadas || 0);

        // Atualizar gráfico se existir
        if (data.vendas_semana && window.Chart) {
            this.updateSalesChart(data.vendas_semana);
        }

        // Atualizar timestamp
        const timestamp = document.querySelector('.last-update, #lastUpdate, .timestamp');
        if (timestamp) {
            timestamp.textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
        }

        console.log('📊 Dashboard UI atualizada');
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }

        // Tentar também com seletores de classe
        const elementByClass = document.querySelector(`.${id}`);
        if (elementByClass) {
            elementByClass.textContent = value;
        }
    }

    updateSalesChart(salesData) {
        const canvas = document.querySelector('#salesChart, #vendasChart, .sales-chart canvas');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        
        // Destruir gráfico anterior se existir
        if (window.currentChart) {
            window.currentChart.destroy();
        }

        const labels = salesData.map(item => item.dia);
        const values = salesData.map(item => item.valor);

        window.currentChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Vendas (R$)',
                    data: values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Vendas: ${new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL'
                                }).format(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('📈 Gráfico de vendas atualizado');
    }

    async loadMenuFromAPI() {
        try {
            const [categoriesResponse, itemsResponse] = await Promise.all([
                fetch(`${this.apiUrl}/menu/categories`),
                fetch(`${this.apiUrl}/menu/items`)
            ]);

            const categoriesResult = await categoriesResponse.json();
            const itemsResult = await itemsResponse.json();

            if (categoriesResult.success && itemsResult.success) {
                // Atualizar dados globais se existirem
                if (window.categoriesData) window.categoriesData = categoriesResult.data;
                if (window.productsData) window.productsData = itemsResult.data;
                
                console.log('🍽️ Cardápio carregado da API');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar cardápio:', error);
        }
    }

    async loadTablesFromAPI() {
        try {
            const response = await fetch(`${this.apiUrl}/tables`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                // Atualizar dados globais se existirem
                if (window.tablesData) window.tablesData = result.data;
                
                // Atualizar interface de mesas se existir
                if (window.updateTablesDisplay) {
                    window.updateTablesDisplay(result.data);
                }
                
                console.log('🪑 Mesas carregadas da API');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar mesas:', error);
        }
    }

    async loadSalesFromAPI() {
        try {
            const response = await fetch(`${this.apiUrl}/sales`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();
            
            if (result.success) {
                // Atualizar dados globais se existirem
                if (window.salesData) window.salesData = result.data;
                
                console.log('💰 Vendas carregadas da API');
            }

        } catch (error) {
            console.error('❌ Erro ao carregar vendas:', error);
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    getMockData() {
        return {
            vendas_hoje: { quantidade: 23, total: 2450.80 },
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
        };
    }
}

// Inicializar quando possível
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => new DashboardAPI(), 500); // Aguardar outros scripts
    });
} else {
    setTimeout(() => new DashboardAPI(), 500);
}

console.log('🔗 Dashboard API Integration carregado');