import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT id, name, capacity, status FROM tables ORDER BY id ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, capacity, status } = req.body;
    const { rows } = await query(
      'INSERT INTO tables(name, capacity, status) VALUES ($1,$2,$3) RETURNING *',
      [name, capacity, status]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, capacity, status } = req.body;
    const { rows } = await query(
      'UPDATE tables SET name=$1, capacity=$2, status=$3 WHERE id=$4 RETURNING *',
      [name, capacity, status, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM tables WHERE id=$1', [id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;
