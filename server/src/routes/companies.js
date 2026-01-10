import express from 'express';
import bcrypt from 'bcryptjs';
import { query, pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Somente superadmin pode gerenciar empresas
router.use(requireRole(['superadmin']));

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, active, created_at FROM companies ORDER BY created_at DESC, id DESC'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
});

router.post('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const { name, active = true, adminUsername, adminEmail, adminPassword } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }

    await client.query('BEGIN');
    const { rows } = await client.query(
      'INSERT INTO companies(name, active) VALUES ($1,$2) RETURNING id, name, active, created_at',
      [String(name).trim(), !!active]
    );
    const company = rows[0];

    let createdAdmin = null;
    if (adminUsername && adminEmail && adminPassword) {
      const passwordHash = await bcrypt.hash(String(adminPassword), 10);
      const u = await client.query(
        'INSERT INTO users(username, email, password_hash, role, company_id, active) VALUES ($1,$2,$3,$4,$5,true) RETURNING id, username, email, role, company_id, active',
        [String(adminUsername).trim(), String(adminEmail).trim(), passwordHash, 'admin', company.id]
      );
      createdAdmin = u.rows[0];
    }

    await client.query('COMMIT');
    res.status(201).json({ company, createdAdmin });
  } catch (e) {
    await client.query('ROLLBACK');
    const msg = String(e?.message || 'Erro ao criar empresa');
    if (msg.includes('duplicate key') || msg.includes('unique')) {
      return res.status(409).json({ error: 'Empresa/usuário já existe' });
    }
    res.status(500).json({ error: 'Erro ao criar empresa' });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body || {};
    const { rows } = await query(
      'UPDATE companies SET name = COALESCE($1, name), active = COALESCE($2, active) WHERE id=$3 RETURNING id, name, active, created_at',
      [name !== undefined ? String(name).trim() : null, active !== undefined ? !!active : null, Number(id)]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

export default router;

