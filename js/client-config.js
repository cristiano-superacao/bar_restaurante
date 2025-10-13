// Configuração do Modo Cliente
// Este arquivo configura o sistema para funcionar como uma aplicação cliente
// totalmente funcional no GitHub Pages e Netlify

class ClientConfig {
    constructor() {
        this.mode = this.detectMode(); // 'client', 'netlify' ou 'server'
        this.storage = 'localStorage'; // 'localStorage' ou 'indexedDB'
        this.enableBackup = true;
        this.autoSave = true;
        this.version = '2.0.0';
        this.apiBase = this.getApiBase();
        
        this.initializeClient();
    }
    
    // Detectar modo de funcionamento
    detectMode() {
        if (window.location.hostname.includes('netlify.app')) {
            return 'netlify';
        } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'local';
        } else {
            return 'client';
        }
    }
    
    // Obter base da API
    getApiBase() {
        switch (this.mode) {
            case 'netlify':
                return '/api';
            case 'local':
                return 'http://localhost:3000/api';
            default:
                return null; // Modo client puro
        }
    }
    
    initializeClient() {
        console.log(`🎯 Modo ${this.mode.toUpperCase()} Ativado - Maria Flor Sistema v${this.version}`);
        console.log(`💾 Armazenamento: ${this.storage}`);
        console.log(`🌐 API Base: ${this.apiBase || 'Local Storage'}`);
        console.log(`🔗 URL: ${window.location.hostname}`);
        
        this.setupDefaultData();
        this.enableOfflineMode();
        
        // Testar conexão com API se disponível
        if (this.apiBase) {
            this.testApiConnection();
        }
    }
    
    // Testar conexão com a API
    async testApiConnection() {
        try {
            const response = await fetch(`${this.apiBase}/status`);
            if (response.ok) {
                const data = await response.json();
                console.log('✅ API conectada:', data.message);
            } else {
                console.log('⚠️ API retornou erro, usando modo local');
                this.apiBase = null;
            }
        } catch (error) {
            console.log('⚠️ API não disponível, funcionando em modo local');
            this.apiBase = null;
        }
    }
    
    setupDefaultData() {
        // Dados iniciais para demonstração
        if (!localStorage.getItem('maria_flor_initialized')) {
            this.setupInitialData();
            localStorage.setItem('maria_flor_initialized', 'true');
            localStorage.setItem('maria_flor_version', this.version);
        }
    }
    
    // Gerenciar dados das mesas
    saveTables(tablesData) {
        try {
            localStorage.setItem('restaurantTables', JSON.stringify(tablesData));
            if (this.enableBackup) {
                this.backupData('tables', tablesData);
            }
            return true;
        } catch (error) {
            console.error('Erro ao salvar mesas:', error);
            return false;
        }
    }
    
    loadTables() {
        try {
            const data = localStorage.getItem('restaurantTables');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao carregar mesas:', error);
            return [];
        }
    }
    
    // Backup automático dos dados
    backupData(type, data) {
        const backup = {
            type,
            data,
            timestamp: new Date().toISOString(),
            version: this.version
        };
        
        const backups = JSON.parse(localStorage.getItem('maria_flor_backups') || '[]');
        backups.push(backup);
        
        // Manter apenas os últimos 10 backups
        if (backups.length > 10) {
            backups.shift();
        }
        
        localStorage.setItem('maria_flor_backups', JSON.stringify(backups));
    }
    
    setupInitialData() {
        // Produtos padrão
        const defaultProducts = [
            {
                id: 1,
                name: 'Hambúrguer Clássico',
                description: 'Hambúrguer artesanal com carne 120g, queijo, alface e tomate',
                price: 25.00,
                category: 'Lanches',
                stock: 50,
                image: 'https://via.placeholder.com/200x200?text=Hambúrguer',
                active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Pizza Margherita',
                description: 'Pizza tradicional com molho de tomate, mussarela e manjericão',
                price: 45.00,
                category: 'Pizzas',
                stock: 20,
                image: 'https://via.placeholder.com/200x200?text=Pizza',
                active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Salada Caesar',
                description: 'Salada fresca com frango grelhado, croutons e molho caesar',
                price: 22.00,
                category: 'Saladas',
                stock: 30,
                image: 'https://via.placeholder.com/200x200?text=Salada',
                active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 4,
                name: 'Batata Frita Especial',
                description: 'Porção generosa de batata frita crocante com temperos especiais',
                price: 12.00,
                category: 'Acompanhamentos',
                stock: 100,
                image: 'https://via.placeholder.com/200x200?text=Batata',
                active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 5,
                name: 'Refrigerante Lata',
                description: 'Refrigerante gelado 350ml - Coca-Cola, Guaraná, Fanta',
                price: 5.00,
                category: 'Bebidas',
                stock: 200,
                image: 'https://via.placeholder.com/200x200?text=Refrigerante',
                active: true,
                created_at: new Date().toISOString()
            },
            {
                id: 6,
                name: 'Suco Natural',
                description: 'Suco natural de frutas da estação 500ml',
                price: 8.00,
                category: 'Bebidas',
                stock: 80,
                image: 'https://via.placeholder.com/200x200?text=Suco',
                active: true,
                created_at: new Date().toISOString()
            }
        ];
        
        // Categorias padrão
        const defaultCategories = [
            { id: 1, name: 'Lanches', description: 'Hambúrgueres e sanduíches', active: true },
            { id: 2, name: 'Pizzas', description: 'Pizzas artesanais', active: true },
            { id: 3, name: 'Saladas', description: 'Pratos saudáveis', active: true },
            { id: 4, name: 'Acompanhamentos', description: 'Porções e sides', active: true },
            { id: 5, name: 'Bebidas', description: 'Bebidas e sucos', active: true },
            { id: 6, name: 'Sobremesas', description: 'Doces e sobremesas', active: true }
        ];
        
        // Vendas de exemplo
        const sampleSales = [
            {
                id: 'V001',
                date: new Date().toISOString(),
                customer: 'João Silva',
                items: [
                    { productId: 1, name: 'Hambúrguer Clássico', price: 25.00, quantity: 1 },
                    { productId: 4, name: 'Batata Frita Especial', price: 12.00, quantity: 1 }
                ],
                total: 37.00,
                paymentMethod: 'card',
                status: 'completed'
            },
            {
                id: 'V002',
                date: new Date(Date.now() - 3600000).toISOString(),
                customer: 'Maria Santos',
                items: [
                    { productId: 2, name: 'Pizza Margherita', price: 45.00, quantity: 1 }
                ],
                total: 45.00,
                paymentMethod: 'pix',
                status: 'completed'
            }
        ];
        
        // Salvar dados iniciais
        localStorage.setItem('maria_flor_products', JSON.stringify(defaultProducts));
        localStorage.setItem('maria_flor_categories', JSON.stringify(defaultCategories));
        localStorage.setItem('maria_flor_sales', JSON.stringify(sampleSales));
        localStorage.setItem('maria_flor_orders', JSON.stringify([]));
        localStorage.setItem('maria_flor_customers', JSON.stringify([]));
        localStorage.setItem('maria_flor_settings', JSON.stringify({
            restaurantName: 'Maria Flor',
            currency: 'BRL',
            timezone: 'America/Sao_Paulo',
            taxRate: 0,
            lastBackup: new Date().toISOString()
        }));
        
        console.log('✅ Dados iniciais configurados');
    }
    
    enableOfflineMode() {
        // Service Worker para funcionamento offline
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('📱 Service Worker registrado:', registration);
                })
                .catch(error => {
                    console.log('❌ Erro ao registrar Service Worker:', error);
                });
        }
    }
    
    // Backup e restore de dados
    exportData() {
        const data = {
            version: this.version,
            timestamp: new Date().toISOString(),
            products: JSON.parse(localStorage.getItem('maria_flor_products') || '[]'),
            categories: JSON.parse(localStorage.getItem('maria_flor_categories') || '[]'),
            sales: JSON.parse(localStorage.getItem('maria_flor_sales') || '[]'),
            orders: JSON.parse(localStorage.getItem('maria_flor_orders') || '[]'),
            customers: JSON.parse(localStorage.getItem('maria_flor_customers') || '[]'),
            settings: JSON.parse(localStorage.getItem('maria_flor_settings') || '{}')
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.products) localStorage.setItem('maria_flor_products', JSON.stringify(data.products));
            if (data.categories) localStorage.setItem('maria_flor_categories', JSON.stringify(data.categories));
            if (data.sales) localStorage.setItem('maria_flor_sales', JSON.stringify(data.sales));
            if (data.orders) localStorage.setItem('maria_flor_orders', JSON.stringify(data.orders));
            if (data.customers) localStorage.setItem('maria_flor_customers', JSON.stringify(data.customers));
            if (data.settings) localStorage.setItem('maria_flor_settings', JSON.stringify(data.settings));
            
            return true;
        } catch (error) {
            console.error('Erro ao importar dados:', error);
            return false;
        }
    }
}

// Classe para gerenciar dados localmente
class LocalDataManager {
    constructor() {
        this.prefix = 'maria_flor_';
    }
    
    // Produtos
    getProducts() {
        return JSON.parse(localStorage.getItem(this.prefix + 'products') || '[]');
    }
    
    saveProduct(product) {
        const products = this.getProducts();
        const existingIndex = products.findIndex(p => p.id === product.id);
        
        if (existingIndex >= 0) {
            products[existingIndex] = { ...product, updated_at: new Date().toISOString() };
        } else {
            product.id = Date.now(); // ID simples baseado em timestamp
            product.created_at = new Date().toISOString();
            products.push(product);
        }
        
        localStorage.setItem(this.prefix + 'products', JSON.stringify(products));
        return product;
    }
    
    deleteProduct(productId) {
        const products = this.getProducts();
        const filteredProducts = products.filter(p => p.id !== productId);
        localStorage.setItem(this.prefix + 'products', JSON.stringify(filteredProducts));
    }
    
    // Vendas
    getSales() {
        return JSON.parse(localStorage.getItem(this.prefix + 'sales') || '[]');
    }
    
    saveSale(sale) {
        const sales = this.getSales();
        sale.id = 'V' + String(sales.length + 1).padStart(3, '0');
        sale.date = new Date().toISOString();
        sales.push(sale);
        localStorage.setItem(this.prefix + 'sales', JSON.stringify(sales));
        
        // Atualizar estoque
        this.updateStock(sale.items);
        
        return sale;
    }
    
    updateStock(items) {
        const products = this.getProducts();
        
        items.forEach(item => {
            const productIndex = products.findIndex(p => p.id === item.productId);
            if (productIndex >= 0) {
                products[productIndex].stock = Math.max(0, products[productIndex].stock - item.quantity);
            }
        });
        
        localStorage.setItem(this.prefix + 'products', JSON.stringify(products));
    }
    
    // Pedidos
    getOrders() {
        return JSON.parse(localStorage.getItem(this.prefix + 'orders') || '[]');
    }
    
    saveOrder(order) {
        const orders = this.getOrders();
        order.id = 'P' + String(orders.length + 1).padStart(3, '0');
        order.created_at = new Date().toISOString();
        orders.push(order);
        localStorage.setItem(this.prefix + 'orders', JSON.stringify(orders));
        return order;
    }
    
    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(o => o.id === orderId);
        
        if (orderIndex >= 0) {
            orders[orderIndex].status = status;
            orders[orderIndex].updated_at = new Date().toISOString();
            localStorage.setItem(this.prefix + 'orders', JSON.stringify(orders));
        }
    }
    
    // Relatórios
    getSalesReport(startDate, endDate) {
        const sales = this.getSales();
        const filteredSales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            return saleDate >= new Date(startDate) && saleDate <= new Date(endDate);
        });
        
        const totalSales = filteredSales.length;
        const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        
        // Vendas por dia
        const salesByDay = {};
        filteredSales.forEach(sale => {
            const day = new Date(sale.date).toISOString().split('T')[0];
            if (!salesByDay[day]) {
                salesByDay[day] = { count: 0, amount: 0 };
            }
            salesByDay[day].count++;
            salesByDay[day].amount += sale.total;
        });
        
        // Produtos mais vendidos
        const productSales = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.name]) {
                    productSales[item.name] = { quantity: 0, amount: 0 };
                }
                productSales[item.name].quantity += item.quantity;
                productSales[item.name].amount += item.price * item.quantity;
            });
        });
        
        return {
            totalSales,
            totalAmount,
            salesByDay: Object.entries(salesByDay).map(([date, data]) => ({
                date,
                count: data.count,
                amount: data.amount
            })),
            topProducts: Object.entries(productSales)
                .map(([name, data]) => ({ name, ...data }))
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5)
        };
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.clientConfig = new ClientConfig();
    window.dataManager = new LocalDataManager();
    
    console.log('🚀 Sistema Cliente Maria Flor inicializado!');
});

// Exportar para uso global
window.ClientConfig = ClientConfig;
window.LocalDataManager = LocalDataManager;