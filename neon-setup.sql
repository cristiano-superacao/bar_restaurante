
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP
);

-- Inserir usuários padrão
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Administrador do Sistema', 'admin@mariaflor.com.br', 'admin123', 'administrador'),
('Gerente Maria Flor', 'gerente@mariaflor.com.br', 'gerente123', 'gerente'),
('Usuário do Sistema', 'usuario@mariaflor.com.br', 'usuario123', 'usuario')
ON CONFLICT (email) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Criar tabela de vendas
CREATE TABLE IF NOT EXISTS vendas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    total DECIMAL(10,2) NOT NULL,
    metodo_pagamento VARCHAR(50),
    status VARCHAR(20) DEFAULT 'concluida',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50),
    estoque INTEGER DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir produtos de exemplo
INSERT INTO produtos (nome, preco, categoria, estoque) VALUES
('Hambúrguer Clássico', 25.00, 'lanches', 50),
('Pizza Margherita', 45.00, 'pizzas', 30),
('Batata Frita', 10.00, 'acompanhamentos', 100),
('Refrigerante', 5.00, 'bebidas', 200),
('Café Expresso', 3.50, 'bebidas', 150)
ON CONFLICT DO NOTHING;

-- Criar tabela de mesas
CREATE TABLE IF NOT EXISTS mesas (
    id SERIAL PRIMARY KEY,
    numero INTEGER UNIQUE NOT NULL,
    capacidade INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'livre',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir mesas
INSERT INTO mesas (numero, capacidade) VALUES
(1, 4), (2, 4), (3, 2), (4, 6), (5, 4),
(6, 2), (7, 4), (8, 8), (9, 4), (10, 2)
ON CONFLICT (numero) DO NOTHING;
