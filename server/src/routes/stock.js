import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT id, name, category, quantity, unit, min_quantity FROM stock ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, unit, minQuantity } = req.body;
    const { rows } = await query(
      'INSERT INTO stock(name, category, quantity, unit, min_quantity) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [name, category, quantity, unit, minQuantity]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, unit, minQuantity } = req.body;
    const { rows } = await query(
      'UPDATE stock SET name=$1, category=$2, quantity=$3, unit=$4, min_quantity=$5 WHERE id=$6 RETURNING *',
      [name, category, quantity, unit, minQuantity, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM stock WHERE id=$1', [id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;
