import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('username').isString().trim().isLength({ min: 3 }),
    body('password').isString().isLength({ min: 6 }),
    body('email').optional().isString().isEmail().normalizeEmail(),
    body('name').optional().isString().trim(),
    body('companyName').isString().trim().isLength({ min: 2 }),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { username, email, password, name, companyName } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Informe usuário e senha' });
    if (!companyName || !String(companyName).trim()) {
      return res.status(400).json({ error: 'Informe o nome da empresa' });
    }

    const exists = await query(
      'SELECT 1 FROM users WHERE username=$1 OR email=$2 LIMIT 1',
      [username, email || username]
    );
    if (exists.rowCount > 0) return res.status(409).json({ error: 'Usuário já existe' });

    const companyNameTrim = String(companyName).trim();

    // Cada cadastro cria sua própria empresa (tenant)
    const existingCompany = await query('SELECT 1 FROM companies WHERE name=$1 LIMIT 1', [companyNameTrim]);
    if (existingCompany.rowCount > 0) {
      return res.status(409).json({ error: 'Já existe uma empresa com esse nome' });
    }
    const c = await query('INSERT INTO companies(name) VALUES ($1) RETURNING id', [companyNameTrim]);
    const companyId = c.rows[0].id;

    const hash = await bcrypt.hash(password, 10);
    const ins = await query(
      'INSERT INTO users(username, email, password_hash, role, company_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, username, email, role, company_id',
      [username, email || `${username}@local`, hash, 'admin', companyId]
    );

    const user = ins.rows[0];
    res.status(201).json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        companyId: user.company_id,
        companyName: companyNameTrim,
      }
    });
  } catch (err) {
    console.error(err);
    const msg = String(err?.message || 'Erro ao registrar');
    if (msg.includes('duplicate key') || msg.includes('unique')) {
      return res.status(409).json({ error: 'Usuário/email/empresa já existe' });
    }
    res.status(500).json({ error: 'Erro ao registrar' });
  }
});

router.post('/login', [
  body('username').optional().isString().trim(),
  body('email').optional().isString().isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { username, email, password } = req.body;
    const identifier = username || email;
    if (!identifier || !password) return res.status(400).json({ error: 'Credenciais inválidas' });

    const { rows } = await query(
      `SELECT u.id, u.username, u.email, u.role, u.company_id, u.active, u.password_hash, c.name as company_name
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.username = $1 OR u.email = $1
       LIMIT 1`,
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
        companyName: user.company_name ?? null,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;

