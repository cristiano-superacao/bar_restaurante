import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, category, quantity, unit, min_quantity, COALESCE(is_addon,false) AS is_addon FROM stock WHERE company_id=$1 ORDER BY id DESC',
      [req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', [
  body('name').isString().trim().isLength({ min: 1 }),
  body('category').isString().trim().isLength({ min: 1 }),
  body('quantity').isFloat({ min: 0 }),
  body('minQuantity').isFloat({ min: 0 }),
  body('unit').optional().isString().trim().isLength({ min: 1 }),
  body('isAddon').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { name, category, quantity, unit, minQuantity, isAddon } = req.body;
    if (!String(name || '').trim()) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!String(category || '').trim()) return res.status(400).json({ error: 'Categoria é obrigatória' });
    const q = Number.isFinite(Number(quantity)) ? Number(quantity) : NaN;
    const minQ = Number.isFinite(Number(minQuantity)) ? Number(minQuantity) : NaN;
    if (!Number.isFinite(q) || q < 0) return res.status(400).json({ error: 'Quantidade deve ser um número >= 0' });
    if (!Number.isFinite(minQ) || minQ < 0) return res.status(400).json({ error: 'Estoque mínimo deve ser um número >= 0' });
    const u = String(unit || 'un');
    const is_addon = (isAddon === undefined) ? false : !!isAddon;
    const { rows } = await query(
      'INSERT INTO stock(company_id, name, category, quantity, unit, min_quantity, is_addon) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.companyId, name, category, q, u, minQ, is_addon]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', [
  body('name').optional().isString().trim().isLength({ min: 1 }),
  body('category').optional().isString().trim().isLength({ min: 1 }),
  body('quantity').optional().isFloat({ min: 0 }),
  body('minQuantity').optional().isFloat({ min: 0 }),
  body('unit').optional().isString().trim().isLength({ min: 1 }),
  body('isAddon').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, category, quantity, unit, minQuantity, isAddon } = req.body;
    if (name !== undefined && !String(name || '').trim()) return res.status(400).json({ error: 'Nome inválido' });
    if (category !== undefined && !String(category || '').trim()) return res.status(400).json({ error: 'Categoria inválida' });
    const q = (quantity === undefined) ? undefined : Number(quantity);
    const minQ = (minQuantity === undefined) ? undefined : Number(minQuantity);
    if (q !== undefined && (!Number.isFinite(q) || q < 0)) return res.status(400).json({ error: 'Quantidade deve ser um número >= 0' });
    if (minQ !== undefined && (!Number.isFinite(minQ) || minQ < 0)) return res.status(400).json({ error: 'Estoque mínimo deve ser um número >= 0' });
    const u = (unit === undefined) ? undefined : String(unit || 'un');
    const is_addon = (isAddon === undefined) ? undefined : !!isAddon;
    const { rows } = await query(
      'UPDATE stock SET name=$1, category=$2, quantity=$3, unit=$4, min_quantity=$5, is_addon=COALESCE($6, is_addon) WHERE company_id=$7 AND id=$8 RETURNING *',
      [name, category, q, u, minQ, is_addon, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM stock WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;

