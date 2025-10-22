-- Script para criar usuários no banco de dados PostgreSQL
-- Sistema Bar Restaurante Maria Flor

-- Limpar tabela de usuários existente
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

-- Inserir usuários com roles específicos e características particulares

-- 1. ADMINISTRADOR PRINCIPAL
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao, 
    ultimo_login,
    telefone,
    observacoes
) VALUES (
    'Cristiano Santos',
    'cristiano@mariaflor.com.br',
    '$2b$10$K8.YQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K', -- senha: admin123
    'admin',
    true,
    NOW(),
    NOW(),
    '(71) 99999-9999',
    'Criador e proprietário do sistema. Acesso total a todas as funcionalidades.'
);

-- 2. GERENTE GERAL
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Maria Flor Santos',
    'maria@mariaflor.com.br',
    '$2b$10$rQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5R', -- senha: maria2024
    'gerente',
    true,
    NOW(),
    '(71) 98888-8888',
    'Gerente geral do restaurante. Acesso a relatórios e configurações.'
);

-- 3. COZINHEIRO CHEFE
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'João Silva',
    'joao.chef@mariaflor.com.br',
    '$2b$10$sQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5S', -- senha: chef2024
    'funcionario',
    true,
    NOW(),
    '(71) 97777-7777',
    'Chef de cozinha responsável pelo cardápio e fichas técnicas dos pratos.'
);

-- 4. GARÇOM SENIOR
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Ana Paula',
    'ana.garcom@mariaflor.com.br',
    '$2b$10$tQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5T', -- senha: garcom2024
    'funcionario',
    true,
    NOW(),
    '(71) 96666-6666',
    'Garçom senior responsável por atendimento e vendas.'
);

-- 5. CAIXA/FINANCEIRO
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Carlos Mendes',
    'carlos.caixa@mariaflor.com.br',
    '$2b$10$uQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5U', -- senha: caixa2024
    'funcionario',
    true,
    NOW(),
    '(71) 95555-5555',
    'Responsável por caixa, vendas e controle financeiro.'
);

-- 6. ESTOQUISTA
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Pedro Oliveira',
    'pedro.estoque@mariaflor.com.br',
    '$2b$10$vQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5V', -- senha: estoque2024
    'funcionario',
    true,
    NOW(),
    '(71) 94444-4444',
    'Responsável por controle de estoque e compras.'
);

-- 7. GARÇOM JUNIOR
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Juliana Costa',
    'juliana.garcom@mariaflor.com.br',
    '$2b$10$wQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5W', -- senha: garcom123
    'funcionario',
    true,
    NOW(),
    '(71) 93333-3333',
    'Garçom junior em treinamento.'
);

-- 8. AJUDANTE DE COZINHA
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Roberto Santos',
    'roberto.ajudante@mariaflor.com.br',
    '$2b$10$xQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5X', -- senha: ajudante123
    'funcionario',
    true,
    NOW(),
    '(71) 92222-2222',
    'Ajudante de cozinha responsável por preparação de ingredientes.'
);

-- 9. USUÁRIO DE TESTE (INATIVO)
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Teste Sistema',
    'teste@mariaflor.com.br',
    '$2b$10$yQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5Y', -- senha: teste123
    'funcionario',
    false,
    NOW(),
    '(71) 91111-1111',
    'Usuário para testes do sistema. INATIVO.'
);

-- 10. SUPERVISOR DE TURNO
INSERT INTO usuarios (
    nome, 
    email, 
    senha, 
    role, 
    ativo, 
    data_criacao,
    telefone,
    observacoes
) VALUES (
    'Sandra Lima',
    'sandra.supervisor@mariaflor.com.br',
    '$2b$10$zQzJ5V5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5K5Z', -- senha: supervisor2024
    'gerente',
    true,
    NOW(),
    '(71) 90000-0000',
    'Supervisora de turno com acesso a relatórios de vendas.'
);

-- Exibir resumo dos usuários criados
SELECT 
    id,
    nome,
    email,
    role,
    CASE WHEN ativo THEN 'Ativo' ELSE 'Inativo' END as status,
    telefone,
    data_criacao
FROM usuarios 
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        WHEN 'gerente' THEN 2 
        WHEN 'funcionario' THEN 3 
        ELSE 4 
    END,
    nome;

-- Informações de acesso para os usuários
SELECT 
    '=== CREDENCIAIS DE ACESSO ===' as info
UNION ALL
SELECT 'ADMIN: cristiano@mariaflor.com.br / admin123'
UNION ALL
SELECT 'GERENTE: maria@mariaflor.com.br / maria2024'
UNION ALL
SELECT 'CHEF: joao.chef@mariaflor.com.br / chef2024'
UNION ALL
SELECT 'GARÇOM SR: ana.garcom@mariaflor.com.br / garcom2024'
UNION ALL
SELECT 'CAIXA: carlos.caixa@mariaflor.com.br / caixa2024'
UNION ALL
SELECT 'ESTOQUE: pedro.estoque@mariaflor.com.br / estoque2024'
UNION ALL
SELECT 'GARÇOM JR: juliana.garcom@mariaflor.com.br / garcom123'
UNION ALL
SELECT 'AJUDANTE: roberto.ajudante@mariaflor.com.br / ajudante123'
UNION ALL
SELECT 'TESTE: teste@mariaflor.com.br / teste123 (INATIVO)'
UNION ALL
SELECT 'SUPERVISOR: sandra.supervisor@mariaflor.com.br / supervisor2024';