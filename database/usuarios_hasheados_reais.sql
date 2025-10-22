-- Script para criar usuários no banco de dados PostgreSQL
-- Sistema Bar Restaurante Maria Flor
-- Gerado automaticamente em 22/10/2025, 17:53:05

-- Limpar tabela de usuários existente
TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;

-- Inserir usuários com senhas hasheadas

-- 1. CRISTIANO SANTOS
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
    '$2a$10$VKId2xYpIYFt43x7VzyTOeO08PA3nFBBBaDUFqCYY0ZcnFNuE8Xfi',
    'admin',
    true,
    NOW(),
    NOW(),
    '(71) 99999-9999',
    'Criador e proprietário do sistema. Acesso total a todas as funcionalidades.'
);

-- 2. MARIA FLOR SANTOS
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
    'Maria Flor Santos',
    'maria@mariaflor.com.br',
    '$2a$10$IU05GOBIbfKVTuIqzWP2J.Xlazwae02ml9JGmZP6EQp1nNMJ4m52u',
    'gerente',
    true,
    NOW(),
    NOW(),
    '(71) 98888-8888',
    'Gerente geral do restaurante. Acesso a relatórios e configurações.'
);

-- 3. JOÃO SILVA
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
    'João Silva',
    'joao.chef@mariaflor.com.br',
    '$2a$10$OkVQev.ngZaW2YnihJ4P1uvy8aFmqfWk6cf7JYZokyUgFN2Dc8sfG',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 97777-7777',
    'Chef de cozinha responsável pelo cardápio e fichas técnicas dos pratos.'
);

-- 4. ANA PAULA
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
    'Ana Paula',
    'ana.garcom@mariaflor.com.br',
    '$2a$10$2Gr02qyREgUBW0xWPwcbcOIyyNIUbsRh3Fe4HoiBIc0G6X9/TiJLW',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 96666-6666',
    'Garçom senior responsável por atendimento e vendas.'
);

-- 5. CARLOS MENDES
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
    'Carlos Mendes',
    'carlos.caixa@mariaflor.com.br',
    '$2a$10$ui4WGIzQyrXMdMmcd5YNfuWjixaV/T/OK7QPDYWk4xsANbEcUmc4G',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 95555-5555',
    'Responsável por caixa, vendas e controle financeiro.'
);

-- 6. PEDRO OLIVEIRA
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
    'Pedro Oliveira',
    'pedro.estoque@mariaflor.com.br',
    '$2a$10$2uAgTGvcO95s/iuq/vE6beTvTqdInn37K2zYconRpuIL6aK.di/Pu',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 94444-4444',
    'Responsável por controle de estoque e compras.'
);

-- 7. JULIANA COSTA
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
    'Juliana Costa',
    'juliana.garcom@mariaflor.com.br',
    '$2a$10$9k8/wTqeq2OBW/LiRIQIU./UFMwwSnm/iXHwfxncvBgdv8vFTXOJe',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 93333-3333',
    'Garçom junior em treinamento.'
);

-- 8. ROBERTO SANTOS
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
    'Roberto Santos',
    'roberto.ajudante@mariaflor.com.br',
    '$2a$10$GuqjK/lL4OZN1M3uMt0tT.xhFkLF1qgD7DHLGvYt8BmYwpjjfiTfi',
    'funcionario',
    true,
    NOW(),
    NOW(),
    '(71) 92222-2222',
    'Ajudante de cozinha responsável por preparação de ingredientes.'
);

-- 9. TESTE SISTEMA
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
    'Teste Sistema',
    'teste@mariaflor.com.br',
    '$2a$10$JqDy8/8F5Mi6jaCe92MFj.D91V6Q7rBV7yidWKIKxfrgEOLuHXxdO',
    'funcionario',
    false,
    NOW(),
    NULL,
    '(71) 91111-1111',
    'Usuário para testes do sistema. INATIVO.'
);

-- 10. SANDRA LIMA
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
    'Sandra Lima',
    'sandra.supervisor@mariaflor.com.br',
    '$2a$10$rF.qyp5nCWup/AYZw5/hsOCfe4FvQToXGhlnIKqbA/6675cBg0Vyu',
    'gerente',
    true,
    NOW(),
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
SELECT '=== CREDENCIAIS DE ACESSO ===' as info;
SELECT 'ADMIN: cristiano@mariaflor.com.br / admin123' as credencial;
SELECT 'GERENTE: maria@mariaflor.com.br / maria2024' as credencial;
SELECT 'FUNCIONARIO: joao.chef@mariaflor.com.br / chef2024' as credencial;
SELECT 'FUNCIONARIO: ana.garcom@mariaflor.com.br / garcom2024' as credencial;
SELECT 'FUNCIONARIO: carlos.caixa@mariaflor.com.br / caixa2024' as credencial;
SELECT 'FUNCIONARIO: pedro.estoque@mariaflor.com.br / estoque2024' as credencial;
SELECT 'FUNCIONARIO: juliana.garcom@mariaflor.com.br / garcom123' as credencial;
SELECT 'FUNCIONARIO: roberto.ajudante@mariaflor.com.br / ajudante123' as credencial;
SELECT 'FUNCIONARIO: teste@mariaflor.com.br / teste123 (INATIVO)' as credencial;
SELECT 'GERENTE: sandra.supervisor@mariaflor.com.br / supervisor2024' as credencial;
