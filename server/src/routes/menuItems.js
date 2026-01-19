import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, category, price, description, image, addon_stock_ids FROM menu_items WHERE company_id = $1 ORDER BY id DESC',
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
  body('addonStockIds').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { name, category, price, description, image } = req.body;
    const addonStockIdsRaw = req.body.addonStockIds;
    if (!String(name || '').trim()) return res.status(400).json({ error: 'Nome é obrigatório' });
    if (!String(category || '').trim()) return res.status(400).json({ error: 'Categoria é obrigatória' });
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: 'Preço deve ser um número >= 0' });

    let addonStockIds = null;
    if (addonStockIdsRaw !== undefined) {
      const arr = Array.isArray(addonStockIdsRaw) ? addonStockIdsRaw : [];
      const ids = arr.map(v => Number(v)).filter(n => Number.isInteger(n) && n > 0);
      const uniq = Array.from(new Set(ids));
      if (uniq.length > 4) return res.status(400).json({ error: 'Selecione no máximo 4 acompanhamentos.' });
      if (uniq.length > 0) {
        const { rows: okRows } = await query(
          'SELECT id FROM stock WHERE company_id=$1 AND is_addon=true AND id = ANY($2::int[])',
          [req.companyId, uniq]
        );
        if ((okRows || []).length !== uniq.length) {
          return res.status(400).json({ error: 'Acompanhamento inválido. Verifique se o item está marcado como acompanhamento no estoque.' });
        }
      }
      addonStockIds = uniq;
    }

    const { rows } = await query(
      'INSERT INTO menu_items(company_id, name, category, price, description, image, addon_stock_ids) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [req.companyId, name, category, p, description, image, addonStockIds]
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
  body('addonStockIds').optional().isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;
    const addonStockIdsRaw = req.body.addonStockIds;
    if (price !== undefined) {
      const p = Number(price);
      if (!Number.isFinite(p) || p < 0) return res.status(400).json({ error: 'Preço deve ser um número >= 0' });
    }

    let addonStockIds = undefined;
    if (addonStockIdsRaw !== undefined) {
      const arr = Array.isArray(addonStockIdsRaw) ? addonStockIdsRaw : [];
      const ids = arr.map(v => Number(v)).filter(n => Number.isInteger(n) && n > 0);
      const uniq = Array.from(new Set(ids));
      if (uniq.length > 4) return res.status(400).json({ error: 'Selecione no máximo 4 acompanhamentos.' });
      if (uniq.length > 0) {
        const { rows: okRows } = await query(
          'SELECT id FROM stock WHERE company_id=$1 AND is_addon=true AND id = ANY($2::int[])',
          [req.companyId, uniq]
        );
        if ((okRows || []).length !== uniq.length) {
          return res.status(400).json({ error: 'Acompanhamento inválido. Verifique se o item está marcado como acompanhamento no estoque.' });
        }
      }
      addonStockIds = uniq;
    }

    const { rows } = await query(
      `UPDATE menu_items
       SET
         name = COALESCE($1, name),
         category = COALESCE($2, category),
         price = COALESCE($3, price),
         description = COALESCE($4, description),
         image = COALESCE($5, image),
         addon_stock_ids = COALESCE($6, addon_stock_ids)
       WHERE company_id=$7 AND id=$8
       RETURNING *`,
      [name ?? null, category ?? null, price ?? null, description ?? null, image ?? null, addonStockIds ?? null, req.companyId, id]
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

