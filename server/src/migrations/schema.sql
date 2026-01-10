-- Schema do sistema Bar/Restaurante (multi-empresa, idempotente)

-- Empresas (multi-tenant)
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  legal_name TEXT,
  document TEXT,
  phone TEXT,
  address TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE companies ADD COLUMN IF NOT EXISTS legal_name TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS document TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS address TEXT;

-- Usuários (superadmin sem company_id)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Cardápio
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT,
  image TEXT
);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;

-- Mesas
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INT NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'Livre'
);
ALTER TABLE tables ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  table_id INT REFERENCES tables(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Pendente',
  order_type TEXT NOT NULL DEFAULT 'Mesa',
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  customer_neighborhood TEXT,
  customer_reference TEXT,
  payment_method TEXT,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_at TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'Mesa';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_neighborhood TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITHOUT TIME ZONE;

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INT NOT NULL REFERENCES menu_items(id) ON DELETE RESTRICT,
  quantity INT NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL DEFAULT 0
);

-- Estoque
CREATE TABLE IF NOT EXISTS stock (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'un',
  min_quantity INT NOT NULL DEFAULT 0
);
ALTER TABLE stock ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;

-- Clientes (por empresa)
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  birthdate DATE,
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS birthdate DATE;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();

-- Reservas (por empresa)
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  date DATE NOT NULL,
  time TIME WITHOUT TIME ZONE NOT NULL,
  people INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Pendente',
  notes TEXT,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS time TIME WITHOUT TIME ZONE;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS people INT NOT NULL DEFAULT 1;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Pendente';
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW();

-- Financeiro
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC(12,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Receita','Despesa')),
  data DATE NOT NULL
);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS company_id INT REFERENCES companies(id) ON DELETE CASCADE;

-- Empresa padrão para dados legados
INSERT INTO companies (name)
SELECT 'Default'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Default');

-- Seeds: Empresas de teste (idempotentes)
INSERT INTO companies (name, legal_name, document, phone, address)
SELECT 'Empresa Teste A', 'Empresa Teste A LTDA', '00000000000000', '(11) 0000-0000', 'Rua Exemplo, 123 - Centro'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Empresa Teste A');

INSERT INTO companies (name, legal_name, document, phone, address)
SELECT 'Empresa Teste B', 'Empresa Teste B LTDA', '11111111111111', '(21) 1111-1111', 'Av. Demonstração, 456 - Bairro'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Empresa Teste B');

-- Seed: Super Admin (login global)
-- Credenciais padrão:
--  username: superadmin
--  senha: superadmin123
INSERT INTO users (username, email, password_hash, role, company_id)
SELECT 'superadmin', 'superadmin@local', '$2b$10$vO7fKGGzj67EM4BGtlUMXeQc2CTk1YhjW670tC9PeM.aN5bhZnDUC', 'superadmin', NULL
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='superadmin');

-- Seed: Admin padrão (vinculado à empresa Default)
-- Credenciais padrão:
--  username: admin
--  senha: admin123
WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
INSERT INTO users (username, email, password_hash, role, company_id)
SELECT 'admin', 'admin@default.local', '$2b$10$YOrlZnm7QyqvVGDZvjQrcuQIfpqvfNaXYEca41g2U94Qy39HVry/K', 'admin', (SELECT id FROM c)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');

-- Seeds: Admins das empresas de teste (idempotentes)
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO users (username, email, password_hash, role, company_id)
SELECT 'adminA', 'adminA@teste.local', '$2b$10$YOrlZnm7QyqvVGDZvjQrcuQIfpqvfNaXYEca41g2U94Qy39HVry/K', 'admin', (SELECT id FROM c)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='adminA');

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO users (username, email, password_hash, role, company_id)
SELECT 'adminB', 'adminB@teste.local', '$2b$10$YOrlZnm7QyqvVGDZvjQrcuQIfpqvfNaXYEca41g2U94Qy39HVry/K', 'admin', (SELECT id FROM c)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='adminB');

-- Vincula dados existentes à empresa Default (quando aplicável)
WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE users
SET company_id = (SELECT id FROM c)
WHERE company_id IS NULL AND role <> 'superadmin';

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE menu_items SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE tables SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE orders SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

-- Backfill: subtotal e total para registros antigos
UPDATE orders SET subtotal = total WHERE subtotal IS NULL OR subtotal = 0;
UPDATE orders SET total = (subtotal + delivery_fee - discount) WHERE total IS NULL OR total = 0;

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE stock SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE transactions SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

WITH c AS (SELECT id FROM companies WHERE name='Default' LIMIT 1)
UPDATE reservations SET company_id = (SELECT id FROM c) WHERE company_id IS NULL;

-- Índices para performance (idempotente)
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_menu_items_company ON menu_items(company_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

CREATE INDEX IF NOT EXISTS idx_tables_company ON tables(company_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_menu ON order_items(menu_item_id);

CREATE INDEX IF NOT EXISTS idx_stock_company ON stock(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_category ON stock(category);

CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

CREATE INDEX IF NOT EXISTS idx_reservations_company ON reservations(company_id);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);

CREATE INDEX IF NOT EXISTS idx_transactions_company ON transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(data);
CREATE INDEX IF NOT EXISTS idx_transactions_tipo ON transactions(tipo);

-- Seeds: Mesas e Cardápio de teste (idempotentes)
-- Empresa Teste A - Mesas
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 01', 4, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 01' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 02', 4, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 02' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 03', 6, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 03' AND company_id=(SELECT id FROM c)
);

-- Empresa Teste A - Cardápio
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Coca-Cola Lata', 'Bebidas', 6.00, '350ml', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Coca-Cola Lata' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Suco de Laranja', 'Bebidas', 8.00, 'Natural 300ml', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Suco de Laranja' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Burger Clássico', 'Pratos', 22.90, 'Pão, carne, queijo, alface e tomate', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Burger Clássico' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Pizza Mussarela', 'Pratos', 39.90, '8 fatias, queijo e orégano', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Pizza Mussarela' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Pudim', 'Sobremesas', 12.00, 'Pudim de leite condensado', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Pudim' AND company_id=(SELECT id FROM c)
);

-- Empresa Teste B - Mesas
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 01', 4, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 01' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 02', 4, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 02' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO tables (company_id, name, capacity, status)
SELECT (SELECT id FROM c), 'Mesa 03', 6, 'Livre'
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM tables WHERE name='Mesa 03' AND company_id=(SELECT id FROM c)
);

-- Empresa Teste B - Cardápio
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Coca-Cola Lata', 'Bebidas', 6.00, '350ml', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Coca-Cola Lata' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Suco de Laranja', 'Bebidas', 8.00, 'Natural 300ml', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Suco de Laranja' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Burger Clássico', 'Pratos', 22.90, 'Pão, carne, queijo, alface e tomate', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Burger Clássico' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Pizza Mussarela', 'Pratos', 39.90, '8 fatias, queijo e orégano', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Pizza Mussarela' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO menu_items (company_id, name, category, price, description, image)
SELECT (SELECT id FROM c), 'Pudim', 'Sobremesas', 12.00, 'Pudim de leite condensado', NULL
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM menu_items WHERE name='Pudim' AND company_id=(SELECT id FROM c)
);

-- Seeds: Estoque básico para empresas de teste
-- Empresa Teste A - Estoque
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Carne', 'Insumos', 20, 'kg', 5
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Carne' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Queijo', 'Insumos', 15, 'kg', 3
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Queijo' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Pão', 'Insumos', 50, 'un', 10
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Pão' AND company_id=(SELECT id FROM c)
);

-- Empresa Teste B - Estoque
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Carne', 'Insumos', 20, 'kg', 5
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Carne' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Queijo', 'Insumos', 15, 'kg', 3
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Queijo' AND company_id=(SELECT id FROM c)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1)
INSERT INTO stock (company_id, name, category, quantity, unit, min_quantity)
SELECT (SELECT id FROM c), 'Pão', 'Insumos', 50, 'un', 10
WHERE EXISTS (SELECT 1 FROM c) AND NOT EXISTS (
  SELECT 1 FROM stock WHERE name='Pão' AND company_id=(SELECT id FROM c)
);

-- Seeds: Pedidos de demonstração com itens (idempotentes)
-- Empresa Teste A - Pedido Demo
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1),
     t AS (SELECT id FROM tables WHERE company_id=(SELECT id FROM c) AND name='Mesa 01' LIMIT 1)
INSERT INTO orders (company_id, table_id, status, order_type, customer_name, payment_method, discount, delivery_fee, subtotal, total, paid_at)
SELECT (SELECT id FROM c), (SELECT id FROM t), 'Concluído', 'Mesa', 'Pedido Demo A', 'Dinheiro', 0, 0, 28.90, 28.90, NOW()
WHERE EXISTS (SELECT 1 FROM c) AND EXISTS (SELECT 1 FROM t)
AND NOT EXISTS (SELECT 1 FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo A');

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1),
     o AS (SELECT id FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo A' LIMIT 1),
     mi1 AS (SELECT id FROM menu_items WHERE company_id=(SELECT id FROM c) AND name='Burger Clássico' LIMIT 1)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT (SELECT id FROM o), (SELECT id FROM mi1), 1, 22.90
WHERE EXISTS (SELECT 1 FROM o) AND EXISTS (SELECT 1 FROM mi1)
AND NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id=(SELECT id FROM o) AND menu_item_id=(SELECT id FROM mi1)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste A' LIMIT 1),
     o AS (SELECT id FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo A' LIMIT 1),
     mi2 AS (SELECT id FROM menu_items WHERE company_id=(SELECT id FROM c) AND name='Coca-Cola Lata' LIMIT 1)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT (SELECT id FROM o), (SELECT id FROM mi2), 1, 6.00
WHERE EXISTS (SELECT 1 FROM o) AND EXISTS (SELECT 1 FROM mi2)
AND NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id=(SELECT id FROM o) AND menu_item_id=(SELECT id FROM mi2)
);

-- Empresa Teste B - Pedido Demo
WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1),
     t AS (SELECT id FROM tables WHERE company_id=(SELECT id FROM c) AND name='Mesa 01' LIMIT 1)
INSERT INTO orders (company_id, table_id, status, order_type, customer_name, payment_method, discount, delivery_fee, subtotal, total, paid_at)
SELECT (SELECT id FROM c), (SELECT id FROM t), 'Concluído', 'Mesa', 'Pedido Demo B', 'Cartão', 0, 0, 28.90, 28.90, NOW()
WHERE EXISTS (SELECT 1 FROM c) AND EXISTS (SELECT 1 FROM t)
AND NOT EXISTS (SELECT 1 FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo B');

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1),
     o AS (SELECT id FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo B' LIMIT 1),
     mi1 AS (SELECT id FROM menu_items WHERE company_id=(SELECT id FROM c) AND name='Burger Clássico' LIMIT 1)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT (SELECT id FROM o), (SELECT id FROM mi1), 1, 22.90
WHERE EXISTS (SELECT 1 FROM o) AND EXISTS (SELECT 1 FROM mi1)
AND NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id=(SELECT id FROM o) AND menu_item_id=(SELECT id FROM mi1)
);

WITH c AS (SELECT id FROM companies WHERE name='Empresa Teste B' LIMIT 1),
     o AS (SELECT id FROM orders WHERE company_id=(SELECT id FROM c) AND customer_name='Pedido Demo B' LIMIT 1),
     mi2 AS (SELECT id FROM menu_items WHERE company_id=(SELECT id FROM c) AND name='Coca-Cola Lata' LIMIT 1)
INSERT INTO order_items (order_id, menu_item_id, quantity, price)
SELECT (SELECT id FROM o), (SELECT id FROM mi2), 1, 6.00
WHERE EXISTS (SELECT 1 FROM o) AND EXISTS (SELECT 1 FROM mi2)
AND NOT EXISTS (
  SELECT 1 FROM order_items WHERE order_id=(SELECT id FROM o) AND menu_item_id=(SELECT id FROM mi2)
);
