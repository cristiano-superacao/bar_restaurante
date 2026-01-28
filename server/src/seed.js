import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool, query } from './db.js';

dotenv.config();

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function mustAllowSeed() {
  const env = String(process.env.NODE_ENV || 'development');
  const allow = String(process.env.ALLOW_SEED || '').toLowerCase() === 'true';
  if (env === 'production' && !allow) {
    throw new Error('Refusing to run seed in production. Set ALLOW_SEED=true if you really want this.');
  }
}

async function ensureSchemaExists() {
  const r = await query("SELECT to_regclass('public.companies') as companies");
  if (!r.rows?.[0]?.companies) {
    throw new Error('Schema not found. Run `npm run migrate` (or `npm run rebuild`) before seeding.');
  }
}

async function ensureOrdersMotoboyColumns() {
  const { rows } = await query(
    `SELECT
        MAX(CASE WHEN column_name='delivery_driver_id' THEN 1 ELSE 0 END) as has_driver_id,
        MAX(CASE WHEN column_name='delivery_driver_name' THEN 1 ELSE 0 END) as has_driver_name
     FROM information_schema.columns
     WHERE table_schema='public' AND table_name='orders'`,
  );
  const hasId = Number(rows?.[0]?.has_driver_id) === 1;
  const hasName = Number(rows?.[0]?.has_driver_name) === 1;
  if (!hasId || !hasName) {
    throw new Error('Orders schema is missing delivery_driver_id/delivery_driver_name. Run `npm run migrate` then try again.');
  }
}

async function upsertCompany({ name, legalName = null, document = null, phone = null, email = null, address = null, active = true, blockedReason = null, trialStartAt = null, trialEndAt = null }) {
  const isActive = !!active;
  const blockedAt = isActive ? null : new Date();
  const blockedReasonDb = isActive ? null : (blockedReason || 'Bloqueada pelo seed');

  const { rows } = await query(
    `INSERT INTO companies(name, legal_name, document, phone, email, address, active, blocked_at, blocked_reason, trial_start_at, trial_end_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT (name) DO UPDATE SET
       legal_name=EXCLUDED.legal_name,
       document=EXCLUDED.document,
       phone=EXCLUDED.phone,
       email=EXCLUDED.email,
       address=EXCLUDED.address,
       active=EXCLUDED.active,
       blocked_at=EXCLUDED.blocked_at,
       blocked_reason=EXCLUDED.blocked_reason,
       trial_start_at=EXCLUDED.trial_start_at,
       trial_end_at=EXCLUDED.trial_end_at
     RETURNING id, company_number, name, active, trial_start_at, trial_end_at`,
    [name, legalName, document, phone, email, address, isActive, blockedAt, blockedReasonDb, trialStartAt, trialEndAt]
  );
  return rows[0];
}

async function upsertUser({ username, email, password, role, companyId = null, active = true, functionName = null }) {
  const passwordHash = await bcrypt.hash(String(password), 10);
  const { rows } = await query(
    `INSERT INTO users(username, email, password_hash, role, function, company_id, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     ON CONFLICT (username) DO UPDATE SET
       email=EXCLUDED.email,
       password_hash=EXCLUDED.password_hash,
       role=EXCLUDED.role,
       function=EXCLUDED.function,
       company_id=EXCLUDED.company_id,
       active=EXCLUDED.active
     RETURNING id, username, email, role, function, company_id, active`,
    [username, email, passwordHash, role, functionName, companyId, !!active]
  );
  return rows[0];
}

async function maybeResetCompanyData(companyId) {
  const reset = String(process.env.SEED_RESET || '').toLowerCase() === 'true';
  if (!reset) return;

  // Ordem importa por causa de FKs
  await query('DELETE FROM order_item_addons WHERE order_item_id IN (SELECT oi.id FROM order_items oi INNER JOIN orders o ON o.id=oi.order_id WHERE o.company_id=$1)', [companyId]);
  await query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE company_id=$1)', [companyId]);
  await query('DELETE FROM orders WHERE company_id=$1', [companyId]);
  await query('DELETE FROM transactions WHERE company_id=$1', [companyId]);
  await query('DELETE FROM reservations WHERE company_id=$1', [companyId]);
  await query('DELETE FROM customers WHERE company_id=$1', [companyId]);
  await query('DELETE FROM menu_items WHERE company_id=$1', [companyId]);
  await query('DELETE FROM stock WHERE company_id=$1', [companyId]);
  await query('DELETE FROM tables WHERE company_id=$1', [companyId]);

  // Remove motoboys de teste (preserva admin)
  await query(
    "DELETE FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy'",
    [companyId]
  );
}

async function ensureTable(companyId, name, capacity = 4) {
  const existing = await query('SELECT id FROM tables WHERE company_id=$1 AND name=$2', [companyId, name]);
  if (existing.rowCount > 0) return existing.rows[0];
  const { rows } = await query(
    'INSERT INTO tables(company_id, name, capacity, status) VALUES ($1,$2,$3,$4) RETURNING id, name',
    [companyId, name, capacity, 'Livre']
  );
  return rows[0];
}

async function ensureCustomer(companyId, data) {
  const { name, email, phone, address, birthdate, notes } = data;
  const existing = await query(
    'SELECT id, name, email, phone, address FROM customers WHERE company_id=$1 AND name=$2 AND COALESCE(phone,\'\')=COALESCE($3,\'\') LIMIT 1',
    [companyId, name, phone || '']
  );
  if (existing.rowCount > 0) return existing.rows[0];
  const { rows } = await query(
    `INSERT INTO customers(company_id, name, email, phone, address, birthdate, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, email, phone, address`,
    [companyId, name, email || null, phone || null, address || null, birthdate || null, notes || null]
  );
  return rows[0];
}

async function ensureStockAddon(companyId, data) {
  const { name, quantity = 200, unit = 'un', minQuantity = 20 } = data;
  const existing = await query('SELECT id FROM stock WHERE company_id=$1 AND name=$2 LIMIT 1', [companyId, name]);
  if (existing.rowCount > 0) {
    await query(
      'UPDATE stock SET category=$1, is_addon=true, unit=$2, min_quantity=$3 WHERE id=$4',
      ['Acompanhamentos', unit, minQuantity, existing.rows[0].id]
    );
    return existing.rows[0];
  }
  const { rows } = await query(
    `INSERT INTO stock(company_id, name, category, quantity, unit, min_quantity, is_addon)
     VALUES ($1,$2,$3,$4,$5,$6,true)
     RETURNING id, name`,
    [companyId, name, 'Acompanhamentos', quantity, unit, minQuantity]
  );
  return rows[0];
}

async function ensureMenuItem(companyId, data) {
  const { name, category, price, description, addonStockIds = [] } = data;
  const existing = await query('SELECT id FROM menu_items WHERE company_id=$1 AND name=$2 LIMIT 1', [companyId, name]);
  if (existing.rowCount > 0) {
    await query(
      'UPDATE menu_items SET category=$1, price=$2, description=$3, addon_stock_ids=$4 WHERE id=$5',
      [category, Number(price) || 0, description || null, addonStockIds, existing.rows[0].id]
    );
    return existing.rows[0];
  }
  const { rows } = await query(
    `INSERT INTO menu_items(company_id, name, category, price, description, addon_stock_ids)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id, name`,
    [companyId, name, category, Number(price) || 0, description || null, addonStockIds]
  );
  return rows[0];
}

function calcOrderTotals({ items, discount = 0, deliveryFee = 0 }) {
  const subtotal = (items || []).reduce((acc, it) => acc + (Number(it.price) * Number(it.quantity)), 0);
  const d = Number(discount) || 0;
  const f = Number(deliveryFee) || 0;
  const total = Math.max(0, subtotal + f - d);
  return { subtotal, discount: d, deliveryFee: f, total };
}

async function ensureSeedOrder({
  companyId,
  ref,
  orderType,
  status,
  tableId = null,
  customer,
  paymentMethod = null,
  deliveryFee = 0,
  discount = 0,
  motoboyUserId = null,
  motoboyName = null,
  items = [],
  addonsByMenuItemId = {},
  paidAt = null,
}) {
  const exists = await query(
    'SELECT id FROM orders WHERE company_id=$1 AND customer_reference=$2 LIMIT 1',
    [companyId, ref]
  );
  if (exists.rowCount > 0) return { id: exists.rows[0].id, created: false };

  const totals = calcOrderTotals({ items, discount, deliveryFee });
  const { rows } = await query(
    `INSERT INTO orders(
      company_id,
      table_id,
      status,
      order_type,
      delivery_driver_id,
      delivery_driver_name,
      customer_name,
      customer_phone,
      customer_address,
      customer_neighborhood,
      customer_reference,
      payment_method,
      discount,
      delivery_fee,
      subtotal,
      total,
      paid_at
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    RETURNING id`,
    [
      companyId,
      tableId,
      status,
      orderType,
      motoboyUserId,
      motoboyName,
      customer?.name || null,
      customer?.phone || null,
      customer?.address || null,
      customer?.neighborhood || null,
      ref,
      paymentMethod,
      totals.discount,
      totals.deliveryFee,
      totals.subtotal,
      totals.total,
      paidAt,
    ]
  );
  const orderId = rows[0].id;

  // Itens
  const orderItemIds = [];
  for (const it of items) {
    const ins = await query(
      'INSERT INTO order_items(order_id, menu_item_id, quantity, price) VALUES ($1,$2,$3,$4) RETURNING id',
      [orderId, it.menuItemId, it.quantity, it.price]
    );
    orderItemIds.push({ orderItemId: ins.rows[0].id, menuItemId: it.menuItemId, quantity: it.quantity });
  }

  // Acompanhamentos (baixa no estoque e vincula)
  for (const oIt of orderItemIds) {
    const addons = Array.isArray(addonsByMenuItemId[String(oIt.menuItemId)]) ? addonsByMenuItemId[String(oIt.menuItemId)] : [];
    for (const ad of addons) {
      const stockId = Number(ad.stockId);
      const perItemQty = Number(ad.quantity) || 1;
      const totalQty = Math.max(1, perItemQty) * Math.max(1, Number(oIt.quantity) || 1);
      await query(
        'UPDATE stock SET quantity = quantity - $1 WHERE company_id=$2 AND id=$3 AND quantity >= $1',
        [totalQty, companyId, stockId]
      );
      await query(
        'INSERT INTO order_item_addons(order_item_id, stock_id, quantity) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [oIt.orderItemId, stockId, totalQty]
      );
    }
  }

  if (String(status) === 'Pago') {
    const data = new Date().toISOString().slice(0, 10);
    await query(
      'INSERT INTO transactions(company_id, descricao, valor, tipo, data) VALUES ($1,$2,$3,$4,$5)',
      [companyId, `Seed ${ref}`, totals.total, 'Receita', data]
    );
  }

  return { id: orderId, created: true };
}

async function validateSeed(companyId) {
  const customers = await query('SELECT COUNT(*)::int AS n FROM customers WHERE company_id=$1', [companyId]);
  const menu = await query('SELECT name FROM menu_items WHERE company_id=$1', [companyId]);
  const stock = await query("SELECT name, COALESCE(is_addon,false) as is_addon FROM stock WHERE company_id=$1", [companyId]);
  const motoboys = await query("SELECT id FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy' AND active=true", [companyId]);
  const deliveries = await query(
    "SELECT delivery_driver_id FROM orders WHERE company_id=$1 AND order_type='Delivery' AND customer_reference LIKE 'SEED-%'",
    [companyId]
  );

  const nCustomers = Number(customers.rows?.[0]?.n) || 0;
  if (nCustomers < 5) throw new Error(`Seed inválido: esperado >=5 clientes, encontrado ${nCustomers}`);

  const haveMenu = new Set((menu.rows || []).map(r => String(r.name || '').toLowerCase()));
  const requiredMenu = ['pastel', 'crepe', 'hamburguer gourmet', 'hamburguer artesanal'];
  for (const n of requiredMenu) {
    const ok = Array.from(haveMenu).some(v => v.includes(n));
    if (!ok) throw new Error(`Seed inválido: item de cardápio ausente: ${n}`);
  }

  const stockByName = new Map((stock.rows || []).map(r => [String(r.name || '').toLowerCase(), !!r.is_addon]));
  for (const n of ['queijo', 'presunto', 'salame', 'catupiry']) {
    if (!stockByName.has(n)) throw new Error(`Seed inválido: acompanhamento ausente no estoque: ${n}`);
    if (!stockByName.get(n)) throw new Error(`Seed inválido: acompanhamento ${n} não está marcado como is_addon`);
  }

  const motoboyIds = new Set((motoboys.rows || []).map(r => Number(r.id)));
  if (motoboyIds.size < 5) throw new Error(`Seed inválido: esperado 5 motoboys, encontrado ${motoboyIds.size}`);

  const deliveryMotoboys = new Set((deliveries.rows || []).map(r => Number(r.delivery_driver_id)).filter(Boolean));
  for (const id of motoboyIds) {
    if (!deliveryMotoboys.has(id)) throw new Error(`Seed inválido: motoboy ${id} sem delivery associado`);
  }
}

async function run() {
  mustAllowSeed();
  requireEnv('DATABASE_URL');

  await ensureSchemaExists();
  await ensureOrdersMotoboyColumns();

  const allowInsecure = String(process.env.ALLOW_INSECURE_SEED || '').toLowerCase() === 'true';
  const superPass = process.env.SEED_SUPERADMIN_PASSWORD || (allowInsecure ? 'superadmin123' : null);
  if (!superPass) {
    throw new Error('SEED_SUPERADMIN_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');
  }

  const now = new Date();
  const in30d = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiredYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const demo = await upsertCompany({
    name: 'Empresa Demo',
    legalName: 'Empresa Demo LTDA',
    document: '00.000.000/0001-00',
    phone: '(11) 4000-0000',
    email: 'contato@demo.local',
    address: 'Av. Principal, 100 - Centro',
    active: true,
    trialStartAt: now,
    trialEndAt: in30d,
  });

  const blocked = await upsertCompany({
    name: 'Empresa Bloqueada',
    legalName: 'Empresa Bloqueada LTDA',
    document: '11.111.111/0001-11',
    phone: '(11) 4111-1111',
    email: 'contato@bloqueada.local',
    address: 'Rua Bloqueio, 1',
    active: false,
    blockedReason: 'Bloqueio de teste (seed)',
    trialStartAt: now,
    trialEndAt: in30d,
  });

  const expired = await upsertCompany({
    name: 'Empresa Trial Expirado',
    legalName: 'Empresa Trial Expirado LTDA',
    document: '22.222.222/0001-22',
    phone: '(11) 4222-2222',
    email: 'contato@trialexpirado.local',
    address: 'Rua Trial, 22',
    active: true,
    trialStartAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    trialEndAt: expiredYesterday,
  });

  await upsertUser({
    username: 'superadmin',
    email: 'superadmin@local',
    password: superPass,
    role: 'superadmin',
    companyId: null,
    active: true,
  });

  const adminPass = process.env.SEED_ADMIN_PASSWORD || (allowInsecure ? 'admin12345' : null);
  if (!adminPass) {
    throw new Error('SEED_ADMIN_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');
  }

  await upsertUser({ username: 'admin_demo', email: 'admin_demo@local', password: adminPass, role: 'admin', companyId: demo.id, active: true });
  await upsertUser({ username: 'admin_bloq', email: 'admin_bloq@local', password: adminPass, role: 'admin', companyId: blocked.id, active: true });
  await upsertUser({ username: 'admin_trial', email: 'admin_trial@local', password: adminPass, role: 'admin', companyId: expired.id, active: true });

  await maybeResetCompanyData(demo.id);

  // Mesas
  const tables = [
    await ensureTable(demo.id, 'Mesa 01', 4),
    await ensureTable(demo.id, 'Mesa 02', 4),
    await ensureTable(demo.id, 'Mesa 03', 6),
    await ensureTable(demo.id, 'Mesa 04', 2),
    await ensureTable(demo.id, 'Mesa 05', 8),
  ];

  // Clientes (fictícios, formato válido)
  const seedTag = 'Seed 2026-01-27';
  const customers = [
    await ensureCustomer(demo.id, { name: 'Ana Oliveira', email: 'ana.oliveira@example.com', phone: '(11) 98888-0101', address: 'Rua das Flores, 123 - Centro', birthdate: '1994-05-12', notes: seedTag }),
    await ensureCustomer(demo.id, { name: 'Bruno Santos', email: 'bruno.santos@example.com', phone: '(11) 98888-0202', address: 'Av. Brasil, 456 - Jardim', birthdate: '1990-11-03', notes: seedTag }),
    await ensureCustomer(demo.id, { name: 'Carla Souza', email: 'carla.souza@example.com', phone: '(11) 98888-0303', address: 'Rua do Comércio, 78 - Centro', birthdate: '1988-02-27', notes: seedTag }),
    await ensureCustomer(demo.id, { name: 'Diego Lima', email: 'diego.lima@example.com', phone: '(11) 98888-0404', address: 'Rua das Acácias, 90 - Vila Nova', birthdate: '1997-08-19', notes: seedTag }),
    await ensureCustomer(demo.id, { name: 'Eduarda Pereira', email: 'eduarda.pereira@example.com', phone: '(11) 98888-0505', address: 'Av. Central, 1000 - Centro', birthdate: '1992-01-21', notes: seedTag }),
  ];

  // Acompanhamentos (estoque)
  const addons = [
    await ensureStockAddon(demo.id, { name: 'Queijo', quantity: 200, unit: 'un', minQuantity: 20 }),
    await ensureStockAddon(demo.id, { name: 'Presunto', quantity: 200, unit: 'un', minQuantity: 20 }),
    await ensureStockAddon(demo.id, { name: 'Salame', quantity: 200, unit: 'un', minQuantity: 20 }),
    await ensureStockAddon(demo.id, { name: 'Catupiry', quantity: 200, unit: 'un', minQuantity: 20 }),
  ];
  const addonIds = addons.map(a => Number(a.id));

  // Produtos (cardápio)
  const menu = {
    pastel: await ensureMenuItem(demo.id, { name: 'Pastel', category: 'Alimentos', price: 12.9, description: 'Pastel crocante com recheio à escolha', addonStockIds: addonIds }),
    crepe: await ensureMenuItem(demo.id, { name: 'Crepe', category: 'Alimentos', price: 16.9, description: 'Crepe feito na hora', addonStockIds: addonIds }),
    burgerGourmet: await ensureMenuItem(demo.id, { name: 'Hambúrguer Gourmet', category: 'Alimentos', price: 34.9, description: 'Blend 180g, pão brioche, molho especial', addonStockIds: addonIds }),
    burgerArtesanal: await ensureMenuItem(demo.id, { name: 'Hambúrguer Artesanal', category: 'Alimentos', price: 29.9, description: 'Carne 160g, queijo, salada e molho da casa', addonStockIds: addonIds }),
  };

  // Motoboys
  const motoboyPass = process.env.SEED_MOTOBOY_PASSWORD || (allowInsecure ? 'motoboy123' : null);
  if (!motoboyPass) {
    throw new Error('SEED_MOTOBOY_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');
  }
  const motoboys = [];
  for (let i = 1; i <= 5; i += 1) {
    const u = await upsertUser({
      username: `motoboy${i}`,
      email: `motoboy${i}@demo.local`,
      password: motoboyPass,
      role: 'staff',
      functionName: 'Motoboy',
      companyId: demo.id,
      active: true,
    });
    motoboys.push(u);
  }

  // Vendas (simulação)
  const seedPrefix = 'SEED-20260127';
  const nowIso = new Date().toISOString();

  // 5 deliveries (um por motoboy)
  for (let i = 0; i < 5; i += 1) {
    const c = customers[i];
    const m = motoboys[i];
    const ref = `${seedPrefix}-D${i + 1}`;
    const items = [
      { menuItemId: menu.pastel.id, quantity: 1 + (i % 2), price: 12.9 },
      { menuItemId: menu.burgerArtesanal.id, quantity: 1, price: 29.9 },
    ];
    const addonsByMenuItemId = {
      [String(menu.pastel.id)]: [
        { stockId: addonIds[i % addonIds.length], quantity: 1 },
      ]
    };
    const status = (i === 4) ? 'Pago' : (i % 2 === 0 ? 'Saiu para Entrega' : 'Entregue');
    const paidAt = status === 'Pago' ? nowIso : null;
    await ensureSeedOrder({
      companyId: demo.id,
      ref,
      orderType: 'Delivery',
      status,
      tableId: null,
      customer: { name: c.name, phone: c.phone, address: c.address, neighborhood: 'Centro' },
      paymentMethod: status === 'Pago' ? 'Pix' : null,
      deliveryFee: 6.0,
      discount: 0,
      motoboyUserId: m.id,
      motoboyName: null,
      items,
      addonsByMenuItemId,
      paidAt,
    });
  }

  // 3 pedidos de mesa pagos
  for (let i = 0; i < 3; i += 1) {
    const ref = `${seedPrefix}-M${i + 1}`;
    const items = [
      { menuItemId: menu.crepe.id, quantity: 1, price: 16.9 },
      { menuItemId: menu.burgerGourmet.id, quantity: 1, price: 34.9 },
    ];
    await ensureSeedOrder({
      companyId: demo.id,
      ref,
      orderType: 'Mesa',
      status: 'Pago',
      tableId: tables[i % tables.length].id,
      customer: { name: `Mesa ${i + 1}`, phone: null, address: null, neighborhood: null },
      paymentMethod: i === 0 ? 'Dinheiro' : (i === 1 ? 'Cartão' : 'Pix'),
      deliveryFee: 0,
      discount: i === 2 ? 5.0 : 0,
      motoboyUserId: null,
      motoboyName: null,
      items,
      addonsByMenuItemId: {},
      paidAt: nowIso,
    });
  }

  // 2 pedidos abertos (para testar fluxo)
  await ensureSeedOrder({
    companyId: demo.id,
    ref: `${seedPrefix}-OPEN1`,
    orderType: 'Mesa',
    status: 'Em Preparo',
    tableId: tables[3].id,
    customer: { name: 'Mesa 04', phone: null, address: null, neighborhood: null },
    paymentMethod: null,
    deliveryFee: 0,
    discount: 0,
    motoboyUserId: null,
    motoboyName: null,
    items: [{ menuItemId: menu.pastel.id, quantity: 2, price: 12.9 }],
    addonsByMenuItemId: { [String(menu.pastel.id)]: [{ stockId: addonIds[0], quantity: 1 }] },
    paidAt: null,
  });
  await ensureSeedOrder({
    companyId: demo.id,
    ref: `${seedPrefix}-OPEN2`,
    orderType: 'Delivery',
    status: 'Pendente',
    tableId: null,
    customer: { name: customers[0].name, phone: customers[0].phone, address: customers[0].address, neighborhood: 'Centro' },
    paymentMethod: null,
    deliveryFee: 6.0,
    discount: 0,
    motoboyUserId: motoboys[0].id,
    motoboyName: null,
    items: [{ menuItemId: menu.crepe.id, quantity: 1, price: 16.9 }],
    addonsByMenuItemId: {},
    paidAt: null,
  });

  await validateSeed(demo.id);

  console.log('✅ Seed concluído');
  console.log(`- superadmin: superadmin / ${process.env.SEED_SUPERADMIN_PASSWORD ? '(senha via env)' : 'superadmin123'}`);
  console.log(`- admin_demo: admin_demo / ${process.env.SEED_ADMIN_PASSWORD ? '(senha via env)' : 'admin12345'}`);
  console.log(`- motoboys: motoboy1..motoboy5 / ${process.env.SEED_MOTOBOY_PASSWORD ? '(senha via env)' : 'motoboy123'}`);
  console.log(`- Empresas: ${demo.name} (#${demo.company_number}), ${blocked.name} (#${blocked.company_number}), ${expired.name} (#${expired.company_number})`);
}

run()
  .catch((e) => {
    console.error('❌ Seed falhou:', e?.message || e);
    process.exit(1);
  })
  .finally(async () => {
    try { await pool.end(); } catch {}
  });
