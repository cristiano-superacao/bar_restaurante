const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { neon } = require('@neondatabase/serverless');
const router = express.Router();

// Configuração do Neon
const sql = neon(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/mariaflor');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }

        // Para demo, aceitar qualquer usuário/senha
        // Em produção, verificar no banco de dados
        if (process.env.NODE_ENV === 'production') {
            // Buscar usuário no banco
            const users = await sql`SELECT * FROM users WHERE username = ${username}`;
            
            if (users.length === 0) {
                return res.status(401).json({ error: 'Usuário não encontrado' });
            }
            
            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Senha incorreta' });
            }
        }

        // Gerar token JWT
        const token = jwt.sign(
            { 
                username: username,
                userId: username // Em produção, usar o ID real do usuário
            },
            process.env.JWT_SECRET || 'maria-flor-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            token: token,
            user: {
                username: username,
                loginTime: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Registrar usuário (apenas para desenvolvimento)
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
        }

        // Hash da senha
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Inserir no banco (apenas se estiver em produção)
        if (process.env.NODE_ENV === 'production') {
            await sql`
                INSERT INTO users (username, password_hash, email, created_at)
                VALUES (${username}, ${passwordHash}, ${email || null}, NOW())
            `;
        }

        res.json({
            success: true,
            message: 'Usuário registrado com sucesso'
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
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

module.exports = router;