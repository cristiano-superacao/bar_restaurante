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
    body('companyLegalName').optional().isString().trim().isLength({ min: 2 }),
    body('companyDocument').optional().isString().trim().isLength({ min: 8 }),
    body('companyPhone').optional().isString().trim().isLength({ min: 6 }),
    body('companyEmail').optional().isEmail().normalizeEmail(),
    body('companyAddress').optional().isString().trim().isLength({ min: 3 }),
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const {
      username,
      email,
      password,
      name,
      companyName,
      companyLegalName,
      companyDocument,
      companyPhone,
      companyEmail,
      companyAddress,
    } = req.body || {};
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

    // Trial padrão para novos cadastros (14 dias)
    const trialStart = new Date();
    const trialEnd = new Date(trialStart.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Cada cadastro cria sua própria empresa (tenant)
    const existingCompany = await query('SELECT 1 FROM companies WHERE name=$1 LIMIT 1', [companyNameTrim]);
    if (existingCompany.rowCount > 0) {
      return res.status(409).json({ error: 'Já existe uma empresa com esse nome' });
    }
    const c = await query(
      `INSERT INTO companies(
        name,
        legal_name,
        document,
        phone,
        email,
        address,
        trial_start_at,
        trial_end_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id, company_number, name, trial_start_at, trial_end_at`,
      [
        companyNameTrim,
        companyLegalName ? String(companyLegalName).trim() : null,
        companyDocument ? String(companyDocument).trim() : null,
        companyPhone ? String(companyPhone).trim() : null,
        companyEmail ? String(companyEmail).trim() : null,
        companyAddress ? String(companyAddress).trim() : null,
        trialStart,
        trialEnd
      ]
    );
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
        company: {
          id: companyId,
          companyNumber: c.rows[0].company_number ?? null,
          name: c.rows[0].name ?? companyNameTrim,
          trialStartAt: c.rows[0].trial_start_at ?? null,
          trialEndAt: c.rows[0].trial_end_at ?? null,
        }
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
      `SELECT
         u.id, u.username, u.email, u.role, u.company_id, u.active, u.password_hash,
         c.id as c_id, c.company_number as company_number, c.name as company_name,
         c.active as company_active, c.blocked_reason as company_blocked_reason,
         c.trial_start_at as trial_start_at, c.trial_end_at as trial_end_at
       FROM users u
       LEFT JOIN companies c ON c.id = u.company_id
       WHERE u.username = $1 OR u.email = $1
       LIMIT 1`,
      [identifier]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário/senha incorretos' });
    if (user.active === false) return res.status(403).json({ error: 'Usuário inativo' });

    // Regras de acesso por empresa: somente para usuários não-superadmin
    if (String(user.role || '').toLowerCase() !== 'superadmin') {
      if (!user.company_id) {
        return res.status(403).json({ error: 'Usuário sem empresa vinculada' });
      }
      if (user.company_active === false) {
        return res.status(403).json({ error: 'Empresa bloqueada', code: 'COMPANY_BLOCKED', reason: user.company_blocked_reason || null });
      }
      if (user.trial_end_at) {
        const now = Date.now();
        const end = new Date(user.trial_end_at).getTime();
        if (!Number.isNaN(end) && now > end) {
          return res.status(403).json({ error: 'Trial expirado', code: 'TRIAL_EXPIRED', trialEndAt: user.trial_end_at });
        }
      }
    }

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
        company: user.company_id ? {
          id: user.company_id,
          companyNumber: user.company_number ?? null,
          name: user.company_name ?? null,
          active: user.company_active ?? null,
          trialStartAt: user.trial_start_at ?? null,
          trialEndAt: user.trial_end_at ?? null,
        } : null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
});

export default router;

