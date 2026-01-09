import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) return res.status(400).json({ error: 'Credenciais inválidas' });

    const { rows } = await query(
      'SELECT id, username, email, role, password_hash FROM users WHERE username = $1 OR email = $1 LIMIT 1',
      [identifier]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário/senha incorretos' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Usuário/senha incorretos' });

    const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev', { expiresIn: '12h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
