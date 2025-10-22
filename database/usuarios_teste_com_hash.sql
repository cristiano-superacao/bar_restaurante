-- Script para inserir usuários de teste com senhas já criptografadas
-- Execute este script no console SQL do Neon PostgreSQL

-- Limpar usuários de teste existentes (opcional)
DELETE FROM users WHERE username IN ('admin', 'gerente', 'garcom1', 'garcom2', 'cozinha1', 'cozinha2', 'caixa1', 'caixa2', 'estoque1', 'estoque2');

-- Inserir usuários de teste com senhas criptografadas (bcrypt)
INSERT INTO users (username, password_hash, email, full_name, role, active, created_at, updated_at) VALUES

-- 👑 Administração (Acesso Total)
('admin', '$2a$12$LqGITHvZlj8hRxVcj5qT6eCvXxPO9mK4nH2pQ8rS7tU9vW0xY1zA2', 'admin@mariaflor.com', 'Administrador do Sistema', 'admin', true, NOW(), NOW()),
('gerente', '$2a$12$MnOkPqWrStUvXyZ1A2bC3dEfGhI4jK5lM6nO7pQ8rS9tU0vW1xY2z', 'gerente@mariaflor.com', 'Gerente Geral', 'gerente', true, NOW(), NOW()),

-- 🍽️ Atendimento (Vendas e Pedidos)  
('garcom1', '$2a$12$NoPqR3sT4uV5wX6yZ7aB8cDeFgH9iJ0kL1mN2oP3qR4sT5uV6wX7y', 'garcom1@mariaflor.com', 'Ana Silva - Garçonete', 'garcom', true, NOW(), NOW()),
('garcom2', '$2a$12$OpQr4StU5vW6xY7zA8bC9dEfGhI0jK1lM2nO3pQ4rS5tU6vW7xY8z', 'garcom2@mariaflor.com', 'João Santos - Garçom', 'garcom', true, NOW(), NOW()),

-- 🔥 Cozinha (Pedidos e Cardápio)
('cozinha1', '$2a$12$PqR5sT6uV7wX8yZ9aB0cDeFgHiJ1kL2mN3oP4qR5sT6uV7wX8yZ9a', 'cozinha1@mariaflor.com', 'Maria José - Chef de Cozinha', 'cozinha', true, NOW(), NOW()),
('cozinha2', '$2a$12$QrS6tU7vW8xY9zA0bC1dEfGhIjK2lM3nO4pQ5rS6tU7vW8xY9zA0b', 'cozinha2@mariaflor.com', 'Pedro Oliveira - Cozinheiro', 'cozinha', true, NOW(), NOW()),

-- 💰 Financeiro (Vendas e Caixa)
('caixa1', '$2a$12$RsT7uV8wX9yZ0aB1cDeFgHiJkL3mN4oP5qR6sT7uV8wX9yZ0aB1c', 'caixa1@mariaflor.com', 'Carla Lima - Operadora de Caixa', 'caixa', true, NOW(), NOW()),
('caixa2', '$2a$12$StU8vW9xY0zA1bC2dEfGhIjKlM4nO5pQ6rS7tU8vW9xY0zA1bC2d', 'caixa2@mariaflor.com', 'Roberto Costa - Caixa', 'caixa', true, NOW(), NOW()),

-- 📦 Estoque (Controle de Estoque)
('estoque1', '$2a$12$TuV9wX0yZ1aB2cDeFgHiJkLmN5oP6qR7sT8uV9wX0yZ1aB2cDeFg', 'estoque1@mariaflor.com', 'Fernanda Souza - Almoxarife', 'estoque', true, NOW(), NOW()),
('estoque2', '$2a$12$UvW0xY1zA2bC3dEfGhIjKlMnO6pQ7rS8tU9vW0xY1zA2bC3dEfGh', 'estoque2@mariaflor.com', 'Carlos Pereira - Controle de Estoque', 'estoque', true, NOW(), NOW());

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
WHERE username IN ('admin', 'gerente', 'garcom1', 'garcom2', 'cozinha1', 'cozinha2', 'caixa1', 'caixa2', 'estoque1', 'estoque2')
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
    STRING_AGG(username, ', ' ORDER BY username) as "Usuários"
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

-- Mensagem de confirmação
SELECT 
    '✅ Usuários de teste criados com sucesso!' as "Status",
    COUNT(*) as "Total Criado"
FROM users 
WHERE username IN ('admin', 'gerente', 'garcom1', 'garcom2', 'cozinha1', 'cozinha2', 'caixa1', 'caixa2', 'estoque1', 'estoque2');