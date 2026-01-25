import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

router.get('/', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, descricao, valor, tipo, data FROM transactions WHERE company_id=$1 ORDER BY data DESC, id DESC',
      [req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.post('/', [
  body('descricao').isString().trim().isLength({ min: 2 }),
  body('valor').isFloat({ min: 0 }),
  body('tipo').isIn(['Receita', 'Despesa']),
  body('data').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { descricao, valor, tipo, data } = req.body;
    const { rows } = await query(
      'INSERT INTO transactions(company_id, descricao, valor, tipo, data) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.companyId, descricao, valor, tipo, data]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Erro ao criar' }); }
});

router.put('/:id', [
  body('descricao').optional().isString().trim().isLength({ min: 2 }),
  body('valor').optional().isFloat({ min: 0 }),
  body('tipo').optional().isIn(['Receita', 'Despesa']),
  body('data').optional().isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    const { id } = req.params;
    const existing = await query(
      'SELECT id, descricao, valor, tipo, data FROM transactions WHERE company_id=$1 AND id=$2',
      [req.companyId, id]
    );
    if (existing.rowCount === 0) return res.status(404).json({ error: 'Transação não encontrada' });

    const prev = existing.rows[0];
    const nextDescricao = (Object.prototype.hasOwnProperty.call(req.body, 'descricao') && req.body.descricao !== undefined)
      ? req.body.descricao
      : prev.descricao;
    const nextValor = (Object.prototype.hasOwnProperty.call(req.body, 'valor') && req.body.valor !== undefined)
      ? req.body.valor
      : prev.valor;
    const nextTipo = (Object.prototype.hasOwnProperty.call(req.body, 'tipo') && req.body.tipo !== undefined)
      ? req.body.tipo
      : prev.tipo;
    const nextData = (Object.prototype.hasOwnProperty.call(req.body, 'data') && req.body.data !== undefined)
      ? req.body.data
      : prev.data;

    const { rows } = await query(
      'UPDATE transactions SET descricao=$1, valor=$2, tipo=$3, data=$4 WHERE company_id=$5 AND id=$6 RETURNING *',
      [nextDescricao, nextValor, nextTipo, nextData, req.companyId, id]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM transactions WHERE company_id=$1 AND id=$2', [req.companyId, id]);
    res.status(204).end();
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

export default router;

