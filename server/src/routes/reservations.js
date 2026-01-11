import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

// Listar reservas da empresa
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT id, name, phone, date, time, people, status, notes, created_at
       FROM reservations
       WHERE company_id=$1
       ORDER BY date DESC, time DESC, id DESC`,
      [req.companyId]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
});

// Criar reserva
router.post('/', [
  body('name').isString().trim().isLength({ min: 2 }),
  body('phone').optional().isString().trim().isLength({ min: 8 }),
  body('date').isISO8601(),
  body('time').matches(/^\d{2}:\d{2}$/),
  body('people').optional().isInt({ min: 1 }),
  body('status').optional().isString().trim().isLength({ min: 2 }),
  body('notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { name, phone, date, time, people, status, notes } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!date) return res.status(400).json({ error: 'Data é obrigatória' });
    if (!time) return res.status(400).json({ error: 'Horário é obrigatório' });

    const p = Math.max(1, Number(people) || 1);
    const st = status ? String(status) : 'Pendente';

    const { rows } = await query(
      `INSERT INTO reservations(company_id, name, phone, date, time, people, status, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id, name, phone, date, time, people, status, notes, created_at`,
      [req.companyId, name, phone || null, date, time, p, st, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch {
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
});

// Atualizar reserva
router.put('/:id', [
  body('name').optional().isString().trim().isLength({ min: 2 }),
  body('phone').optional().isString().trim().isLength({ min: 8 }),
  body('date').optional().isISO8601(),
  body('time').optional().matches(/^\d{2}:\d{2}$/),
  body('people').optional().isInt({ min: 1 }),
  body('status').optional().isString().trim().isLength({ min: 2 }),
  body('notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, phone, date, time, people, status, notes } = req.body || {};
    const p = Math.max(1, Number(people) || 1);
    const st = status ? String(status) : 'Pendente';

    const { rows } = await query(
      `UPDATE reservations
       SET name=$1, phone=$2, date=$3, time=$4, people=$5, status=$6, notes=$7
       WHERE company_id=$8 AND id=$9
       RETURNING id, name, phone, date, time, people, status, notes, created_at`,
      [name, phone || null, date, time, p, st, notes || null, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar reserva' });
  }
});

// Excluir reserva
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM reservations WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch {
    res.status(500).json({ error: 'Erro ao excluir reserva' });
  }
});

export default router;
