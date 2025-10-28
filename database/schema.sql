-- Script de criação do banco de dados para Maria Flor Sistema
-- Execute este script no seu banco Neon PostgreSQL

-- Tabela de usuários (formato padrão para APIs)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de usuários (formato alternativo para compatibilidade com Netlify Functions)
-- Essa tabela usa nomenclatura em português para melhor alinhamento com o sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMP DEFAULT NOW(),
    ultimo_login TIMESTAMP,
    telefone VARCHAR(20),
    observacoes TEXT
);

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2),
    category_id INTEGER REFERENCES categories(id),
    stock_quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    barcode VARCHAR(50),
    image_url VARCHAR(500),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    birth_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(200), -- Para vendas sem cadastro de cliente
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(20) NOT NULL, -- 'cash', 'card', 'pix', 'transfer'
    status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
    notes TEXT,
    table_number INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens de venda
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(200) NOT NULL, -- Para backup caso produto seja deletado
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    notes TEXT
);

-- Tabela de pedidos (para controle de cozinha)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id),
    table_number INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'preparing', 'ready', 'delivered', 'cancelled'
    priority INTEGER DEFAULT 1, -- 1=normal, 2=high, 3=urgent
    estimated_time INTEGER, -- em minutos
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens de pedido
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(200) NOT NULL,
    quantity INTEGER NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'preparing', 'ready'
);

-- Tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity INTEGER NOT NULL,
    reason VARCHAR(100), -- 'sale', 'purchase', 'loss', 'adjustment'
    reference_id INTEGER, -- ID da venda ou compra relacionada
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zip_code VARCHAR(10),
    tax_id VARCHAR(20), -- CNPJ/CPF
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de compras
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES suppliers(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'received', 'cancelled'
    purchase_date DATE DEFAULT CURRENT_DATE,
    received_date DATE,
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de itens de compra
CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100), -- 'utilities', 'rent', 'salaries', 'supplies', 'other'
    expense_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(20),
    supplier_id INTEGER REFERENCES suppliers(id),
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description VARCHAR(200),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Inserir dados iniciais

-- Categorias padrão
INSERT INTO categories (name, description) VALUES 
('Lanches', 'Hambúrgueres, sanduíches e similares'),
('Pizzas', 'Pizzas diversas'),
('Saladas', 'Saladas e pratos saudáveis'),
('Bebidas', 'Refrigerantes, sucos e bebidas'),
('Sobremesas', 'Doces e sobremesas'),
('Acompanhamentos', 'Batatas, porções e acompanhamentos')
ON CONFLICT DO NOTHING;

-- Produtos iniciais
INSERT INTO products (name, description, price, category_id, stock_quantity) VALUES 
('Hambúrguer Clássico', 'Hambúrguer com carne, queijo, alface e tomate', 25.00, 1, 50),
('Hambúrguer Bacon', 'Hambúrguer com bacon, queijo e molho especial', 30.00, 1, 30),
('Pizza Margherita', 'Pizza com tomate, mussarela e manjericão', 45.00, 2, 20),
('Pizza Calabresa', 'Pizza com calabresa, cebola e azeitonas', 48.00, 2, 15),
('Salada Caesar', 'Salada com frango, croutons e molho caesar', 22.00, 3, 25),
('Refrigerante Lata', 'Refrigerante 350ml', 5.00, 4, 200),
('Suco Natural', 'Suco de frutas naturais 500ml', 8.00, 4, 100),
('Batata Frita', 'Porção de batata frita crocante', 10.00, 6, 80),
('Pudim', 'Pudim de leite condensado', 12.00, 5, 15)
ON CONFLICT DO NOTHING;

-- Usuário administrador padrão (senha: admin123)
INSERT INTO users (username, password_hash, email, full_name, role) VALUES 
('admin', '$2b$10$8K1p/a0dSKc4XkVZYN1GI.i1w8.U8r9ZVZ1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z', 'admin@mariaflor.com', 'Administrador', 'admin'),
('demo', '$2b$10$8K1p/a0dSKc4XkVZYN1GI.i1w8.U8r9ZVZ1Z1Z1Z1Z1Z1Z1Z1Z1Z1Z', 'demo@mariaflor.com', 'Usuário Demo', 'user')
ON CONFLICT DO NOTHING;

-- Configurações iniciais
INSERT INTO settings (key, value, description) VALUES 
('restaurant_name', 'Maria Flor', 'Nome do restaurante'),
('restaurant_address', 'Salvador, BA - Bairro do Resgate', 'Endereço do restaurante'),
('tax_rate', '0.00', 'Taxa de imposto padrão'),
('currency', 'BRL', 'Moeda padrão'),
('timezone', 'America/Sao_Paulo', 'Fuso horário')
ON CONFLICT DO NOTHING;