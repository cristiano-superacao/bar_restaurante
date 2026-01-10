import express from 'express';
import { query } from '../db.js';
import { requireCompanyContext } from '../middleware/auth.js';

const router = express.Router();

router.use(requireCompanyContext);

function normalizeOrderType(v) {
  const t = String(v || '').trim();
  if (!t) return null;
  if (t === 'Mesa' || t === 'Delivery') return t;
  return null;
}

function calcTotals({ items = [], discount = 0, deliveryFee = 0 }) {
  const subtotal = (items || []).reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
  const d = Number(discount) || 0;
  const f = Number(deliveryFee) || 0;
  const total = subtotal + f - d;
  return {
    subtotal,
    discount: d,
    deliveryFee: f,
    total: total < 0 ? 0 : total,
  };
}

router.get('/', async (req, res) => {
  try {
    const type = normalizeOrderType(req.query.type);
    const params = [req.companyId];
    const where = ['o.company_id = $1'];
    if (type) {
      params.push(type);
      where.push(`o.order_type = $${params.length}`);
    }
    const { rows } = await query(
      `SELECT o.id,
              t.name as table_name,
              o.status,
              o.order_type,
              o.customer_name,
              o.customer_phone,
              o.customer_address,
              o.customer_neighborhood,
              o.customer_reference,
              o.payment_method,
              o.discount,
              o.delivery_fee,
              o.subtotal,
              o.total,
              o.paid_at,
              o.created_at
       FROM orders o
       LEFT JOIN tables t ON t.id = o.table_id AND t.company_id = o.company_id
       WHERE ${where.join(' AND ')}
       ORDER BY o.created_at DESC, o.id DESC`,
      params
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar' }); }
});

router.get('/:id/items', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await query(
      `SELECT oi.id, oi.menu_item_id, oi.quantity, oi.price, mi.name
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1 AND o.company_id = $2
       ORDER BY oi.id ASC`,
      [id, req.companyId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar itens' }); }
});

router.post('/', async (req, res) => {
  const client = await (await import('../db.js')).pool.connect();
  try {
    const {
      tableId,
      status = 'Pendente',
      items = [],
      orderType,
      customerName,
      customerPhone,
      customerAddress,
      customerNeighborhood,
      customerReference,
      discount = 0,
      deliveryFee = 0,
    } = req.body;

    const normalizedType = normalizeOrderType(orderType) || 'Mesa';
    await client.query('BEGIN');

    // Valida mesa pertence à empresa
    if (normalizedType === 'Mesa') {
      if (!tableId) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Mesa é obrigatória para pedido do tipo Mesa' });
      }
      const t = await client.query('SELECT id FROM tables WHERE id=$1 AND company_id=$2', [tableId, req.companyId]);
      if (t.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Mesa inválida para esta empresa' });
      }
    } else {
      // Delivery
      if (!String(customerName || '').trim()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Nome do cliente é obrigatório para Delivery' });
      }
      if (!String(customerPhone || '').trim()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Telefone do cliente é obrigatório para Delivery' });
      }
      if (!String(customerAddress || '').trim()) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Endereço do cliente é obrigatório para Delivery' });
      }
    }

    // Valida itens pertencem à empresa
    for (const it of items) {
      const mi = await client.query('SELECT id FROM menu_items WHERE id=$1 AND company_id=$2', [it.menuItemId, req.companyId]);
      if (mi.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Item de cardápio inválido para esta empresa' });
      }
    }

    const totals = calcTotals({ items, discount, deliveryFee });
    const { rows } = await client.query(
      `INSERT INTO orders(
          company_id,
          table_id,
          status,
          order_type,
          customer_name,
          customer_phone,
          customer_address,
          customer_neighborhood,
          customer_reference,
          discount,
          delivery_fee,
          subtotal,
          total
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING id, table_id, status, order_type, subtotal, discount, delivery_fee, total, created_at`,
      [
        req.companyId,
        normalizedType === 'Mesa' ? tableId : null,
        status,
        normalizedType,
        customerName || null,
        customerPhone || null,
        customerAddress || null,
        customerNeighborhood || null,
        customerReference || null,
        totals.discount,
        totals.deliveryFee,
        totals.subtotal,
        totals.total,
      ]
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
    const {
      status,
      customerName,
      customerPhone,
      customerAddress,
      customerNeighborhood,
      customerReference,
      discount,
      deliveryFee,
      paymentMethod,
    } = req.body || {};

    const current = await query(
      'SELECT id, subtotal, discount, delivery_fee FROM orders WHERE company_id=$1 AND id=$2',
      [req.companyId, id]
    );
    if (current.rowCount === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    const base = current.rows[0];
    const d = (discount === undefined) ? Number(base.discount) : (Number(discount) || 0);
    const f = (deliveryFee === undefined) ? Number(base.delivery_fee) : (Number(deliveryFee) || 0);
    const subtotal = Number(base.subtotal) || 0;
    const total = Math.max(0, subtotal + f - d);

    const { rows } = await query(
      `UPDATE orders
       SET status = COALESCE($1, status),
           customer_name = COALESCE($2, customer_name),
           customer_phone = COALESCE($3, customer_phone),
           customer_address = COALESCE($4, customer_address),
           customer_neighborhood = COALESCE($5, customer_neighborhood),
           customer_reference = COALESCE($6, customer_reference),
           discount = $7,
           delivery_fee = $8,
           subtotal = COALESCE(NULLIF($9, 0), subtotal),
           total = $10,
           payment_method = COALESCE($11, payment_method)
       WHERE company_id=$12 AND id=$13
       RETURNING *`,
      [
        status ?? null,
        customerName ?? null,
        customerPhone ?? null,
        customerAddress ?? null,
        customerNeighborhood ?? null,
        customerReference ?? null,
        d,
        f,
        subtotal,
        total,
        paymentMethod ?? null,
        req.companyId,
        id,
      ]
    );
    res.json(rows[0] || null);
  } catch (e) { res.status(500).json({ error: 'Erro ao atualizar' }); }
});

router.post('/:id/close', async (req, res) => {
  const client = await (await import('../db.js')).pool.connect();
  try {
    const { id } = req.params;
    const { paymentMethod, discount = 0, deliveryFee = 0 } = req.body || {};
    await client.query('BEGIN');

    const o = await client.query(
      'SELECT id, order_type, created_at FROM orders WHERE company_id=$1 AND id=$2',
      [req.companyId, id]
    );
    if (o.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    const itemsRes = await client.query(
      `SELECT COALESCE(SUM(quantity * price), 0) as subtotal
       FROM order_items
       WHERE order_id = $1`,
      [id]
    );
    const subtotal = Number(itemsRes.rows[0]?.subtotal) || 0;
    const d = Number(discount) || 0;
    const f = Number(deliveryFee) || 0;
    const total = Math.max(0, subtotal + f - d);

    const upd = await client.query(
      `UPDATE orders
       SET status='Pago',
           payment_method = $1,
           discount = $2,
           delivery_fee = $3,
           subtotal = $4,
           total = $5,
           paid_at = NOW()
       WHERE company_id=$6 AND id=$7
       RETURNING *`,
      [paymentMethod || null, d, f, subtotal, total, req.companyId, id]
    );

    const descricao = `Pedido #${String(id).padStart(4, '0')} (${o.rows[0].order_type || 'Mesa'})`;
    const data = new Date().toISOString().slice(0, 10);
    await client.query(
      'INSERT INTO transactions(company_id, descricao, valor, tipo, data) VALUES ($1,$2,$3,$4,$5)',
      [req.companyId, descricao, total, 'Receita', data]
    );

    await client.query('COMMIT');
    res.json({ ok: true, order: upd.rows[0] });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro ao fechar conta' });
  } finally {
    client.release();
  }
});

router.get('/:id/receipt', async (req, res) => {
  try {
    const { id } = req.params;
    const o = await query(
      `SELECT o.*, c.name as company_name, c.legal_name, c.document, c.phone as company_phone, c.address as company_address
       FROM orders o
       INNER JOIN companies c ON c.id = o.company_id
       WHERE o.company_id=$1 AND o.id=$2`,
      [req.companyId, id]
    );
    if (o.rowCount === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    const items = await query(
      `SELECT oi.quantity, oi.price, mi.name
       FROM order_items oi
       INNER JOIN orders o ON o.id = oi.order_id
       LEFT JOIN menu_items mi ON mi.id = oi.menu_item_id
       WHERE oi.order_id = $1 AND o.company_id = $2
       ORDER BY oi.id ASC`,
      [id, req.companyId]
    );

    const order = o.rows[0];
    res.json({
      company: {
        name: order.company_name,
        legalName: order.legal_name,
        document: order.document,
        phone: order.company_phone,
        address: order.company_address,
      },
      order: {
        id: order.id,
        status: order.status,
        orderType: order.order_type,
        tableId: order.table_id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        customerNeighborhood: order.customer_neighborhood,
        customerReference: order.customer_reference,
        paymentMethod: order.payment_method,
        discount: Number(order.discount) || 0,
        deliveryFee: Number(order.delivery_fee) || 0,
        subtotal: Number(order.subtotal) || 0,
        total: Number(order.total) || 0,
        paidAt: order.paid_at,
        createdAt: order.created_at,
      },
      items: (items.rows || []).map(it => ({
        name: it.name,
        quantity: Number(it.quantity) || 0,
        price: Number(it.price) || 0,
        lineTotal: (Number(it.price) || 0) * (Number(it.quantity) || 0),
      }))
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao gerar cupom' });
  }
});

router.delete('/:id', async (req, res) => {
  const client = await (await import('../db.js')).pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query(
      'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE id=$1 AND company_id=$2)',
      [id, req.companyId]
    );
    await client.query('DELETE FROM orders WHERE id=$1 AND company_id=$2', [id, req.companyId]);
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
