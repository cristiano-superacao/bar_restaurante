import express from 'express';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

// Listar clientes da empresa
router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, phone, address, birthdate, notes, created_at FROM customers WHERE company_id=$1 ORDER BY id DESC',
      [req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar clientes' }); }
});

// Criar cliente
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address, birthdate, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
    const { rows } = await query(
      'INSERT INTO customers(company_id, name, email, phone, address, birthdate, notes) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, name, email, phone, address, birthdate, notes, created_at',
      [req.companyId, name, email || null, phone || null, address || null, birthdate || null, notes || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar cliente' }); }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, birthdate, notes } = req.body;
    const { rows } = await query(
      'UPDATE customers SET name=$1, email=$2, phone=$3, address=$4, birthdate=$5, notes=$6 WHERE company_id=$7 AND id=$8 RETURNING id, name, email, phone, address, birthdate, notes, created_at',
      [name, email || null, phone || null, address || null, birthdate || null, notes || null, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar cliente' }); }
});

// Excluir cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM customers WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir cliente' }); }
});

export default router;

