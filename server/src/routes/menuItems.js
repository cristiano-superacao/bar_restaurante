import express from 'express';
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

router.post('/', async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;
    const { rows } = await query(
      'INSERT INTO menu_items(company_id, name, category, price, description, image) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.companyId, name, category, price, description, image]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, image } = req.body;
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

