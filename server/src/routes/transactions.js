import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query('SELECT id, descricao, valor, tipo, data FROM transactions ORDER BY data DESC, id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', async (req, res) => {
  try {
    const { descricao, valor, tipo, data } = req.body;
    const { rows } = await query(
      'INSERT INTO transactions(descricao, valor, tipo, data) VALUES ($1,$2,$3,$4) RETURNING *',
      [descricao, valor, tipo, data]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, tipo, data } = req.body;
    const { rows } = await query(
      'UPDATE transactions SET descricao=$1, valor=$2, tipo=$3, data=$4 WHERE id=$5 RETURNING *',
      [descricao, valor, tipo, data, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM transactions WHERE id=$1', [id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;
