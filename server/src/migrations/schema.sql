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
