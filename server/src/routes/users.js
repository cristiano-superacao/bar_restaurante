import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { getCompanyScope, requireRole } from '../middleware/auth.js';

const router = express.Router();

function canManageUsers(role) {
  return role === 'superadmin' || role === 'admin';
}

router.get('/', async (req, res) => {
  try {
    const { isSuperadmin, companyId } = getCompanyScope(req);

    if (isSuperadmin) {
      // Superadmin pode listar todos ou filtrar por empresa
      const { rows } = await query(
        `SELECT u.id, u.username, u.email, u.role, u.active, u.company_id, c.name as company_name, u.created_at
         FROM users u
         LEFT JOIN companies c ON c.id = u.company_id
         WHERE ($1::int IS NULL OR u.company_id = $1)
         ORDER BY u.created_at DESC, u.id DESC`,
        [companyId]
      );
      return res.json(rows);
    }

    // Admin/Staff só podem ver usuários da própria empresa
    if (!req.user?.companyId) return res.status(400).json({ error: 'companyId não definido no usuário' });
    const { rows } = await query(
      `SELECT id, username, email, role, active, company_id, created_at
       FROM users
       WHERE company_id = $1
       ORDER BY created_at DESC, id DESC`,
      [Number(req.user.companyId)]
    );
    return res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

router.post('/', async (req, res) => {
  try {
    const role = req.user?.role;
    if (!canManageUsers(role)) return res.status(403).json({ error: 'Forbidden' });

    const { username, email, password, role: newRole = 'staff', companyId } = req.body || {};
    if (!username || !email || !password) return res.status(400).json({ error: 'username, email e password são obrigatórios' });

    let cid = null;
    if (role === 'superadmin') {
      cid = companyId ? Number(companyId) : null;
      if (!cid) return res.status(400).json({ error: 'companyId é obrigatório para criar usuário como superadmin' });
    } else {
      cid = Number(req.user.companyId);
      // Admin não pode criar superadmin
      if (newRole === 'superadmin') return res.status(403).json({ error: 'Não permitido' });
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const { rows } = await query(
      'INSERT INTO users(username, email, password_hash, role, company_id, active) VALUES ($1,$2,$3,$4,$5,true) RETURNING id, username, email, role, active, company_id, created_at',
      [String(username).trim(), String(email).trim(), passwordHash, String(newRole), cid]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    const msg = String(e?.message || 'Erro ao criar usuário');
    if (msg.includes('duplicate key') || msg.includes('unique')) {
      return res.status(409).json({ error: 'Usuário/email já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const role = req.user?.role;
    if (!canManageUsers(role)) return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.params;
    const { username, email, role: newRole, active, password } = req.body || {};

    // Admin não pode promover para superadmin
    if (role !== 'superadmin' && newRole === 'superadmin') {
      return res.status(403).json({ error: 'Não permitido' });
    }

    let passwordHash = null;
    if (password) passwordHash = await bcrypt.hash(String(password), 10);

    // Escopo: admin só pode alterar usuários da própria empresa
    const scopeCompany = role === 'superadmin' ? null : Number(req.user.companyId);

    const { rows } = await query(
      `UPDATE users
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           role = COALESCE($3, role),
           active = COALESCE($4, active),
           password_hash = COALESCE($5, password_hash)
       WHERE id = $6
         AND ($7::int IS NULL OR company_id = $7)
       RETURNING id, username, email, role, active, company_id, created_at`,
      [
        username !== undefined ? String(username).trim() : null,
        email !== undefined ? String(email).trim() : null,
        newRole !== undefined ? String(newRole) : null,
        active !== undefined ? !!active : null,
        passwordHash,
        Number(id),
        scopeCompany,
      ]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = req.user?.role;
    if (!canManageUsers(role)) return res.status(403).json({ error: 'Forbidden' });

    const { id } = req.params;
    const scopeCompany = role === 'superadmin' ? null : Number(req.user.companyId);

    await query(
      'DELETE FROM users WHERE id=$1 AND ($2::int IS NULL OR company_id=$2)',
      [Number(id), scopeCompany]
    );
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir usuário' });
  }
});

// Utilitário opcional: rota para validar acesso superadmin
router.get('/me/is-superadmin', requireRole(['superadmin']), (_req, res) => {
  res.json({ ok: true });
});

export default router;

