import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query, pool } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Somente superadmin pode gerenciar empresas
router.use(requireRole(['superadmin']));

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT
        id,
        company_number,
        name,
        legal_name,
        document,
        phone,
        email,
        address,
        active,
        blocked_at,
        blocked_reason,
        trial_start_at,
        trial_end_at,
        created_at
       FROM companies
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao listar empresas' });
  }
});

router.post('/', [
  body('name').isString().trim().isLength({ min: 2 }),
  body('legalName').optional().isString().trim().isLength({ min: 2 }),
  body('document').optional().isString().trim().isLength({ min: 8 }),
  body('phone').optional().isString().trim().isLength({ min: 6 }),
  body('email').optional().isString().isEmail().normalizeEmail(),
  body('address').optional().isString().trim().isLength({ min: 3 }),
  body('active').optional().isBoolean().toBoolean(),
  body('blockedReason').optional().isString().trim().isLength({ min: 2 }),
  body('trialStartAt').optional().isISO8601(),
  body('trialEndAt').optional().isISO8601(),
  body('adminUsername').optional().isString().trim().isLength({ min: 3 }),
  body('adminEmail').optional().isString().isEmail().normalizeEmail(),
  body('adminPassword').optional().isString().isLength({ min: 6 }),
], async (req, res) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const {
      name,
      legalName,
      document,
      phone,
      email,
      address,
      active = true,
      blockedReason,
      trialStartAt,
      trialEndAt,
      adminUsername,
      adminEmail,
      adminPassword
    } = req.body || {};
    if (!name || String(name).trim().length < 2) {
      return res.status(400).json({ error: 'Nome da empresa é obrigatório' });
    }

    const start = trialStartAt ? new Date(String(trialStartAt)) : null;
    const end = trialEndAt ? new Date(String(trialEndAt)) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
      return res.status(400).json({ error: 'Datas de trial inválidas' });
    }
    if (start && end && end.getTime() < start.getTime()) {
      return res.status(400).json({ error: 'trialEndAt deve ser maior ou igual a trialStartAt' });
    }

    const isActive = !!active;
    const blockedAt = isActive ? null : new Date();
    const blockedReasonDb = isActive ? null : (blockedReason ? String(blockedReason).trim() : 'Bloqueada pelo superadmin');

    await client.query('BEGIN');
    const { rows } = await client.query(
      `INSERT INTO companies(name, legal_name, document, phone, email, address, active, blocked_at, blocked_reason, trial_start_at, trial_end_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING id, company_number, name, legal_name, document, phone, email, address, active, blocked_at, blocked_reason, trial_start_at, trial_end_at, created_at`,
      [
        String(name).trim(),
        legalName !== undefined ? String(legalName).trim() : null,
        document !== undefined ? String(document).trim() : null,
        phone !== undefined ? String(phone).trim() : null,
        email !== undefined ? String(email).trim() : null,
        address !== undefined ? String(address).trim() : null,
        isActive,
        blockedAt,
        blockedReasonDb,
        start,
        end
      ]
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

router.put('/:id', [
  body('name').optional().isString().trim().isLength({ min: 2 }),
  body('legalName').optional().isString().trim().isLength({ min: 2 }),
  body('document').optional().isString().trim().isLength({ min: 8 }),
  body('phone').optional().isString().trim().isLength({ min: 6 }),
  body('email').optional().isString().isEmail().normalizeEmail(),
  body('address').optional().isString().trim().isLength({ min: 3 }),
  body('active').optional().isBoolean().toBoolean(),
  body('blockedReason').optional().isString().trim().isLength({ min: 2 }),
  body('trialStartAt').optional().isISO8601(),
  body('trialEndAt').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, legalName, document, phone, email, address, active, blockedReason, trialStartAt, trialEndAt } = req.body || {};

    const start = trialStartAt ? new Date(String(trialStartAt)) : null;
    const end = trialEndAt ? new Date(String(trialEndAt)) : null;
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
      return res.status(400).json({ error: 'Datas de trial inválidas' });
    }
    if (start && end && end.getTime() < start.getTime()) {
      return res.status(400).json({ error: 'trialEndAt deve ser maior ou igual a trialStartAt' });
    }

    // Regra de bloqueio: ao desativar, registra blocked_at/blocked_reason; ao ativar, limpa
    const activeProvided = active !== undefined;
    const newActive = activeProvided ? !!active : null;
    const blockNow = activeProvided && newActive === false;
    const unblock = activeProvided && newActive === true;

    const shouldUpdateBlocked = blockNow || unblock;
    const blockedAtValue = blockNow ? new Date() : (unblock ? null : null);
    const blockedReasonValue = blockNow
      ? (blockedReason ? String(blockedReason).trim() : 'Bloqueada pelo superadmin')
      : null;

    const { rows } = await query(
      `UPDATE companies SET
        name = COALESCE($1, name),
        legal_name = COALESCE($2, legal_name),
        document = COALESCE($3, document),
        phone = COALESCE($4, phone),
        email = COALESCE($5, email),
        address = COALESCE($6, address),
        active = COALESCE($7, active),
        blocked_at = CASE WHEN $8 THEN $9 ELSE blocked_at END,
        blocked_reason = CASE WHEN $8 THEN $10 ELSE blocked_reason END,
        trial_start_at = COALESCE($11, trial_start_at),
        trial_end_at = COALESCE($12, trial_end_at)
       WHERE id=$13
       RETURNING id, company_number, name, legal_name, document, phone, email, address, active, blocked_at, blocked_reason, trial_start_at, trial_end_at, created_at`,
      [
        name !== undefined ? String(name).trim() : null,
        legalName !== undefined ? String(legalName).trim() : null,
        document !== undefined ? String(document).trim() : null,
        phone !== undefined ? String(phone).trim() : null,
        email !== undefined ? String(email).trim() : null,
        address !== undefined ? String(address).trim() : null,
        activeProvided ? newActive : null,
        shouldUpdateBlocked,
        blockedAtValue,
        blockedReasonValue,
        start,
        end,
        Number(id)
      ]
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: 'Erro ao atualizar empresa' });
  }
});

router.delete('/:id', [
  body('confirm').isString().trim().isLength({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { confirm } = req.body || {};

    const c = await query('SELECT id, name, company_number FROM companies WHERE id=$1', [Number(id)]);
    if (c.rowCount === 0) return res.status(404).json({ error: 'Empresa não encontrada' });
    const company = c.rows[0];

    const confirmValue = String(confirm || '').trim();
    const ok = confirmValue === String(company.name)
      || confirmValue === String(company.company_number)
      || confirmValue.toUpperCase() === 'DELETE';
    if (!ok) {
      return res.status(400).json({ error: 'Confirmação inválida para exclusão' });
    }

    await query('DELETE FROM companies WHERE id=$1', [Number(id)]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao excluir empresa' });
  }
});

export default router;

