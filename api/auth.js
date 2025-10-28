const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Login - suporta tanto username quanto email
router.post('/login', async (req, res) => {
    try {
        const { username, password, email, senha } = req.body;
        
        // Aceitar tanto username/password quanto email/senha
        const loginIdentifier = username || email;
        const loginPassword = password || senha;

        if (!loginIdentifier || !loginPassword) {
            return res.status(400).json({ error: 'Credenciais são obrigatórias' });
        }

        let user = null;
        let isPasswordValid = false;

        // Em produção, verificar no banco de dados
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Tentar buscar na tabela users primeiro
            try {
                const users = await sql`
                    SELECT * FROM users 
                    WHERE (username = ${loginIdentifier} OR email = ${loginIdentifier})
                    AND active = true
                `;
                
                if (users.length > 0) {
                    user = users[0];
                    isPasswordValid = await bcrypt.compare(loginPassword, user.password_hash);
                    
                    if (isPasswordValid) {
                        user = {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            name: user.full_name,
                            role: user.role
                        };
                    }
                }
            } catch (err) {
                console.log('Tabela users não encontrada ou erro:', err.message);
            }

            // Se não encontrou na tabela users, tentar na tabela usuarios
            if (!user || !isPasswordValid) {
                try {
                    const usuarios = await sql`
                        SELECT * FROM usuarios 
                        WHERE email = ${loginIdentifier}
                        AND ativo = true
                    `;
                    
                    if (usuarios.length > 0) {
                        const usuario = usuarios[0];
                        // Verificar senha (pode ser hash ou texto)
                        if (usuario.senha_hash === loginPassword) {
                            isPasswordValid = true;
                        } else {
                            isPasswordValid = await bcrypt.compare(loginPassword, usuario.senha_hash);
                        }
                        
                        if (isPasswordValid) {
                            user = {
                                id: usuario.id,
                                username: usuario.email.split('@')[0],
                                email: usuario.email,
                                name: usuario.nome,
                                role: usuario.role
                            };
                        }
                    }
                } catch (err) {
                    console.log('Tabela usuarios não encontrada ou erro:', err.message);
                }
            }
            
            if (!user || !isPasswordValid) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
        } else {
            // Modo desenvolvimento - aceitar credenciais padrão
            const demoUsers = {
                'admin': { password: 'admin123', name: 'Administrador', role: 'admin' },
                'admin@mariaflor.com.br': { password: 'admin123', name: 'Administrador', role: 'admin' },
                'gerente@mariaflor.com.br': { password: 'gerente123', name: 'Gerente', role: 'gerente' }
            };
            
            const demoUser = demoUsers[loginIdentifier];
            if (demoUser && demoUser.password === loginPassword) {
                user = {
                    id: 1,
                    username: loginIdentifier,
                    email: loginIdentifier,
                    name: demoUser.name,
                    role: demoUser.role
                };
            } else {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET || 'maria-flor-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: user
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

// Registrar usuário (apenas para desenvolvimento)
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, nome, senha } = req.body;

        const finalUsername = username || email?.split('@')[0];
        const finalEmail = email;
        const finalPassword = password || senha;
        const finalName = nome || username;

        if (!finalEmail || !finalPassword) {
            return res.status(400).json({ error: 'Email e senha são obrigatórios' });
        }

        // Hash da senha
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(finalPassword, saltRounds);

        let userId;

        // Inserir no banco (apenas se estiver em produção)
        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Tentar inserir na tabela users
            try {
                const result = await sql`
                    INSERT INTO users (username, password_hash, email, full_name, created_at)
                    VALUES (${finalUsername}, ${passwordHash}, ${finalEmail}, ${finalName}, NOW())
                    RETURNING id
                `;
                userId = result[0].id;
            } catch (err) {
                // Se falhar, tentar na tabela usuarios
                const result = await sql`
                    INSERT INTO usuarios (nome, email, senha_hash, data_criacao)
                    VALUES (${finalName}, ${finalEmail}, ${passwordHash}, NOW())
                    RETURNING id
                `;
                userId = result[0].id;
            }
        } else {
            // In development mode, generate a simple sequential ID (not security-sensitive)
            userId = Date.now();
        }

        res.json({
            success: true,
            message: 'Usuário registrado com sucesso',
            id: userId
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        
        // Verificar se é erro de duplicação
        if (error.message?.includes('duplicate') || error.message?.includes('unique')) {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        
        res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
    }
});

// Verificar token
router.get('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Token não fornecido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'maria-flor-secret-key');
        res.json({
            success: true,
            user: decoded
        });

    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
});

// Listar usuários (apenas para admin)
router.get('/users', async (req, res) => {
    try {
        let users = [];

        if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
            // Tentar buscar da tabela usuarios primeiro
            try {
                users = await sql`
                    SELECT id, nome as name, email, role, ativo as active, data_criacao as created_at
                    FROM usuarios
                    WHERE ativo = true
                    ORDER BY nome
                `;
            } catch (err) {
                // Se falhar, buscar da tabela users
                users = await sql`
                    SELECT id, full_name as name, email, role, active, created_at
                    FROM users
                    WHERE active = true
                    ORDER BY full_name
                `;
            }
        } else {
            users = [
                { id: 1, name: 'Administrador', email: 'admin@mariaflor.com.br', role: 'admin', active: true },
                { id: 2, name: 'Gerente', email: 'gerente@mariaflor.com.br', role: 'gerente', active: true }
            ];
        }

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

module.exports = router;