import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const { rows } = await query(
      `SELECT o.id, t.name as table_name, o.status, o.total, o.created_at
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id
       ORDER BY o.created_at DESC, o.id DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT oi.id, oi.quantity, oi.price, mi.name
       FROM order_items oi
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1
       ORDER BY oi.id ASC`,
      [id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar itens' }); }
});

router.post('/', async (req, res) => {
  const client = await (await import('../db.js')).pool.connect();
  try {
    const { tableId, status = 'Pendente', items = [] } = req.body;
    await client.query('BEGIN');
    const total = items.reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
    const { rows } = await client.query(
      'INSERT INTO orders(table_id, status, total) VALUES ($1,$2,$3) RETURNING id, table_id, status, total, created_at',
      [tableId, status, total]
    );
    const order = rows[0];
    for (const it of items) {
      await client.query(
        'INSERT INTO order_items(order_id, menu_item_id, quantity, price) VALUES ($1,$2,$3,$4)',
        [order.id, it.menuItemId, it.quantity, it.price]
      );
    }
    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao criar pedido' });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { rows } = await query('UPDATE orders SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.delete('/:id', async (req, res) => {
  const client = await (await import('../db.js')).pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query('DELETE FROM order_items WHERE order_id=$1', [id]);
    await client.query('DELETE FROM orders WHERE id=$1', [id]);
    await client.query('COMMIT');
    res.status(204).end();
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao excluir pedido' });
  } finally {
    client.release();
  }
});

export default router;
