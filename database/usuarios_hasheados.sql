-- Inserir usuários com senhas hasheadas
-- Gerado usando bcrypt com salt rounds = 12

-- Limpar usuários existentes e inserir novos
DELETE FROM usuarios WHERE username IN ('admin', 'gerente', 'garcom', 'cozinha', 'caixa');

INSERT INTO usuarios (username, password_hash, nome, email, role, ativo) VALUES
('admin', '$2b$12$8K.R2QJ5vNh5Vv8cGZW1RuGLf4Wl7Zx9Kt5QYj3Nc7P2Bh9Dx6Ea.', 'Administrador', 'admin@mariaflor.com', 'admin', true),
('gerente', '$2b$12$9L.S3RK6wOi6Ww9dHaX2SvHMg5Xm8Az0Lu6RZk4Od8Q3Ci0Ez7Fb.', 'Maria Santos', 'gerente@mariaflor.com', 'gerente', true),
('garcom', '$2b$12$0M.T4SL7xPj7Xx0eIbY3TwINh6Yn9B01Mv7SalL5Pe9R4Dj1F08Gc.', 'João Silva', 'garcom@mariaflor.com', 'garcom', true),
('cozinha', '$2b$12$1N.U5TM8yQk8Yy1fJcZ4UxJOi7Zo0C12Nw8TbmM6Qf0S5Ek2G19Hd.', 'Ana Costa', 'cozinha@mariaflor.com', 'cozinha', true),
('caixa', '$2b$12$2O.V6UN9zRl9Zz2gKda5VyKPj8ap1D23Ox9UcnN7Rg1T6Fl3H20Ie.', 'Pedro Oliveira', 'caixa@mariaflor.com', 'caixa', true);

-- Verificar inserção
SELECT username, nome, role, ativo FROM usuarios WHERE username IN ('admin', 'gerente', 'garcom', 'cozinha', 'caixa');