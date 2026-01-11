import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

const ALLOWED_TABLE_STATUS = ['Livre', 'Ocupada'];

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, capacity, status FROM tables WHERE company_id = $1 ORDER BY id ASC',
      [req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', [
  body('name').isString().trim().isLength({ min: 1 }),
  body('capacity').isInt({ min: 1 }),
  body('status').optional().isIn(ALLOWED_TABLE_STATUS),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { name, capacity, status } = req.body;
    if (status && !ALLOWED_TABLE_STATUS.includes(String(status))) {
      return res.status(400).json({ error: 'Status de mesa inválido' });
    }
    const { rows } = await query(
      'INSERT INTO tables(company_id, name, capacity, status) VALUES ($1,$2,$3,$4) RETURNING *',
      [req.companyId, name, capacity, status]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', [
  body('name').optional().isString().trim().isLength({ min: 1 }),
  body('capacity').optional().isInt({ min: 1 }),
  body('status').optional().isIn(ALLOWED_TABLE_STATUS),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, capacity, status } = req.body;
    if (status && !ALLOWED_TABLE_STATUS.includes(String(status))) {
      return res.status(400).json({ error: 'Status de mesa inválido' });
    }
    const { rows } = await query(
      'UPDATE tables SET name=$1, capacity=$2, status=$3 WHERE company_id=$4 AND id=$5 RETURNING *',
      [name, capacity, status, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM tables WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;

