import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, category, price, description, image FROM menu_items WHERE company_id = $1 ORDER BY id DESC',
      [req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', [
  body('name').isString().trim().isLength({ min: 2 }),
  body('category').isString().trim().isLength({ min: 2 }),
  body('price').isFloat({ min: 0 }),
  body('description').optional().isString().trim(),
  body('image').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { name, category, price, description, image } = req.body;
    if (!String(name || '').trim()) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!String(category || '').trim()) return res.status(400).json({ error: 'Categoria é obrigatória' });
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: 'Preço deve ser um número >= 0' });
    const { rows } = await query(
      'INSERT INTO menu_items(company_id, name, category, price, description, image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.companyId, name, category, p, description, image]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', [
  body('name').optional().isString().trim().isLength({ min: 2 }),
  body('category').optional().isString().trim().isLength({ min: 2 }),
  body('price').optional().isFloat({ min: 0 }),
  body('description').optional().isString().trim(),
  body('image').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;
    if (price !== undefined) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: 'Preço deve ser um número >= 0' });
    }
    const { rows } = await query(
      'UPDATE menu_items SET name=$1, category=$2, price=$3, description=$4, image=$5 WHERE company_id=$6 AND id=$7 RETURNING *',
      [name, category, price, description, image, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM menu_items WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;

