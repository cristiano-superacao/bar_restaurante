-- Script para inserir usuários de teste no Sistema Maria Flor
-- Execute este script após criar o schema principal

-- Primeiro, vamos garantir que a extensão pgcrypto está disponível para criptografia
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Limpar usuários de teste existentes (opcional)
DELETE FROM users WHERE username IN ('admin', 'gerente', 'garcom1', 'garcom2', 'cozinha1', 'cozinha2', 'caixa1', 'caixa2', 'estoque1', 'estoque2');

-- Inserir usuários de teste com senhas criptografadas
INSERT INTO users (username, password_hash, email, full_name, role, active, created_at, updated_at) VALUES
-- 👑 Administração (Acesso Total)
('admin', crypt('MariaFlor2025!', gen_salt('bf')), 'admin@mariaflor.com', 'Administrador do Sistema', 'admin', true, NOW(), NOW()),
('gerente', crypt('Gerente123!', gen_salt('bf')), 'gerente@mariaflor.com', 'Gerente Geral', 'gerente', true, NOW(), NOW()),

-- 🍽️ Atendimento (Vendas e Pedidos)
('garcom1', crypt('Garcom123!', gen_salt('bf')), 'garcom1@mariaflor.com', 'Ana Silva - Garçonete', 'garcom', true, NOW(), NOW()),
('garcom2', crypt('Garcom123!', gen_salt('bf')), 'garcom2@mariaflor.com', 'João Santos - Garçom', 'garcom', true, NOW(), NOW()),

-- 🔥 Cozinha (Pedidos e Cardápio)
('cozinha1', crypt('Cozinha123!', gen_salt('bf')), 'cozinha1@mariaflor.com', 'Maria José - Chef de Cozinha', 'cozinha', true, NOW(), NOW()),
('cozinha2', crypt('Cozinha123!', gen_salt('bf')), 'cozinha2@mariaflor.com', 'Pedro Oliveira - Cozinheiro', 'cozinha', true, NOW(), NOW()),

-- 💰 Financeiro (Vendas e Caixa)
('caixa1', crypt('Caixa123!', gen_salt('bf')), 'caixa1@mariaflor.com', 'Carla Lima - Operadora de Caixa', 'caixa', true, NOW(), NOW()),
('caixa2', crypt('Caixa123!', gen_salt('bf')), 'caixa2@mariaflor.com', 'Roberto Costa - Caixa', 'caixa', true, NOW(), NOW()),

-- 📦 Estoque (Controle de Estoque)
('estoque1', crypt('Estoque123!', gen_salt('bf')), 'estoque1@mariaflor.com', 'Fernanda Souza - Almoxarife', 'estoque', true, NOW(), NOW()),
('estoque2', crypt('Estoque123!', gen_salt('bf')), 'estoque2@mariaflor.com', 'Carlos Pereira - Controle de Estoque', 'estoque', true, NOW(), NOW());

-- Verificar se os usuários foram criados corretamente
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    active,
    created_at
FROM users 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'gerente' THEN 2 
        WHEN 'garcom' THEN 3 
        WHEN 'cozinha' THEN 4 
        WHEN 'caixa' THEN 5 
        WHEN 'estoque' THEN 6 
        ELSE 7 
    END,
    username;

-- Mostrar estatísticas dos usuários criados
SELECT 
    role as "Perfil",
    COUNT(*) as "Quantidade",
    STRING_AGG(username, ', ') as "Usuários"
FROM users 
WHERE username IN ('admin', 'gerente', 'garcom1', 'garcom2', 'cozinha1', 'cozinha2', 'caixa1', 'caixa2', 'estoque1', 'estoque2')
GROUP BY role
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'gerente' THEN 2 
        WHEN 'garcom' THEN 3 
        WHEN 'cozinha' THEN 4 
        WHEN 'caixa' THEN 5 
        WHEN 'estoque' THEN 6 
        ELSE 7 
    END;