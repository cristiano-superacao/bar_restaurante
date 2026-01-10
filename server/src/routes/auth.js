import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, name, companyName } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Informe usuário e senha' });

    const exists = await query(
      'SELECT 1 FROM users WHERE username=$1 OR email=$2 LIMIT 1',
      [username, email || username]
    );
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Usuário já existe' });

    let companyId = null;
    if (companyName && String(companyName).trim()) {
      const c = await query('INSERT INTO companies(name) VALUES ($1) RETURNING id', [String(companyName).trim()]);
      companyId = c.rows[0].id;
    } else {
      // fallback para empresa Default
      const c = await query("SELECT id FROM companies WHERE name='Default' LIMIT 1", []);
      if (c.rowCount > 0) companyId = c.rows[0].id;
    }

    const hash = await bcrypt.hash(password, 10);
    const ins = await query(
      'INSERT INTO users(username, email, password_hash, role, company_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, email, role, company_id',
      [username, email || `${username}@local`, hash, 'admin', companyId]
    );

    const user = ins.rows[0];
    res.status(201).json({ ok: true, user: { id: user.id, username: user.username, email: user.email, role: user.role, companyId: user.company_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) return res.status(400).json({ error: 'Credenciais inválidas' });

    const { rows } = await query(
      'SELECT id, username, email, role, company_id, active, password_hash FROM users WHERE username = $1 OR email = $1 LIMIT 1',
      [identifier]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário/senha incorretos' });
    if (user.active === false) return res.status(403).json({ error: 'Usuário inativo' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(401).json({ error: 'Usuário/senha incorretos' });

    const token = jwt.sign(
      { sub: user.id, role: user.role, companyId: user.company_id ?? null },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '12h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.company_id ?? null,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;
