import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

function envFlag(name) {
  return String(process.env[name] || '').toLowerCase() === 'true';
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function mustAllowSeed() {
  const env = String(process.env.NODE_ENV || 'development');
  const allow = envFlag('ALLOW_SEED');
  if (env === 'production' && !allow) {
    throw new Error('Refusing to run seed in production. Set ALLOW_SEED=true if you really want this.');
  }
}

function buildPool(connectionString) {
  const isProd = process.env.NODE_ENV === 'production';
  const sslConfig = process.env.DATABASE_SSL === 'false' ? false : (isProd ? { rejectUnauthorized: false } : false);
  return new Pool({ connectionString, ssl: sslConfig });
}

const COMPANY_NAME = process.env.SEED_QA_COMPANY_NAME || 'Empresa QA';
const SEED_TAG = process.env.SEED_QA_TAG || `QA-${new Date().toISOString().slice(0, 10)}`;

function sample(list, index) {
  return list[index % list.length];
}

function toMoney(n) {
  return Math.round(Number(n) * 100) / 100;
}

async function ensureSchemaExists(pool) {
  const r = await pool.query("SELECT to_regclass('public.companies') as companies");
  if (!r.rows?.[0]?.companies) {
    throw new Error('Schema not found. Run `npm run migrate` (or `npm run rebuild`) before seeding.');
  }
}

async function ensureOrdersMotoboyColumns(pool) {
  const { rows } = await pool.query(
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

async function upsertCompany(pool, data) {
  const {
    name,
    legalName = null,
    document = null,
    phone = null,
    email = null,
    address = null,
    active = true,
    blockedReason = null,
    trialStartAt = null,
    trialEndAt = null,
  } = data;

  const isActive = !!active;
  const blockedAt = isActive ? null : new Date();
  const blockedReasonDb = isActive ? null : (blockedReason || 'Bloqueada pelo seed QA');

  const { rows } = await pool.query(
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

async function updateCompany(pool, companyId, patch) {
  const {
    legalName = undefined,
    document = undefined,
    phone = undefined,
    email = undefined,
    address = undefined,
    active = undefined,
    blockedReason = undefined,
    trialStartAt = undefined,
    trialEndAt = undefined,
  } = patch;

  const current = await pool.query('SELECT * FROM companies WHERE id=$1', [companyId]);
  if (current.rowCount === 0) throw new Error('Company not found');
  const row = current.rows[0];

  const nextActive = active === undefined ? row.active : !!active;
  const nextBlockedAt = nextActive ? null : (row.blocked_at || new Date());
  const nextBlockedReason = nextActive ? null : (blockedReason ?? row.blocked_reason ?? 'Bloqueada pelo seed QA');

  await pool.query(
    `UPDATE companies SET
      legal_name = COALESCE($1, legal_name),
      document = COALESCE($2, document),
      phone = COALESCE($3, phone),
      email = COALESCE($4, email),
      address = COALESCE($5, address),
      active = $6,
      blocked_at = $7,
      blocked_reason = $8,
      trial_start_at = COALESCE($9, trial_start_at),
      trial_end_at = COALESCE($10, trial_end_at)
     WHERE id=$11`,
    [
      legalName === undefined ? null : legalName,
      document === undefined ? null : document,
      phone === undefined ? null : phone,
      email === undefined ? null : email,
      address === undefined ? null : address,
      nextActive,
      nextBlockedAt,
      nextBlockedReason,
      trialStartAt === undefined ? null : trialStartAt,
      trialEndAt === undefined ? null : trialEndAt,
      companyId,
    ]
  );
}

async function upsertUser(pool, data) {
  const {
    username,
    email,
    password,
    role,
    companyId = null,
    active = true,
    functionName = null,
  } = data;

  const passwordHash = await bcrypt.hash(String(password), 10);
  const { rows } = await pool.query(
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

async function resetCompanyData(pool, companyId) {
  if (!envFlag('SEED_RESET')) return;

  await pool.query('DELETE FROM order_item_addons WHERE order_item_id IN (SELECT oi.id FROM order_items oi INNER JOIN orders o ON o.id=oi.order_id WHERE o.company_id=$1)', [companyId]);
  await pool.query('DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE company_id=$1)', [companyId]);
  await pool.query('DELETE FROM orders WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM transactions WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM reservations WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM customers WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM menu_items WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM stock WHERE company_id=$1', [companyId]);
  await pool.query('DELETE FROM tables WHERE company_id=$1', [companyId]);

  await pool.query(
    "DELETE FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,'')) IN ('motoboy','garçom','cozinha','caixa','supervisor')",
    [companyId]
  );
}

async function ensureTable(pool, companyId, name, capacity = 4) {
  const existing = await pool.query('SELECT id FROM tables WHERE company_id=$1 AND name=$2', [companyId, name]);
  if (existing.rowCount > 0) return existing.rows[0];
  const { rows } = await pool.query(
    'INSERT INTO tables(company_id, name, capacity, status) VALUES ($1,$2,$3,$4) RETURNING id, name',
    [companyId, name, capacity, 'Livre']
  );
  return rows[0];
}

async function ensureCustomer(pool, companyId, data) {
  const { name, email, phone, address, birthdate, notes } = data;
  const existing = await pool.query(
    'SELECT id FROM customers WHERE company_id=$1 AND name=$2 AND COALESCE(phone,\'\')=COALESCE($3,\'\') LIMIT 1',
    [companyId, name, phone || '']
  );
  if (existing.rowCount > 0) return existing.rows[0];
  const { rows } = await pool.query(
    `INSERT INTO customers(company_id, name, email, phone, address, birthdate, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name, email, phone, address`,
    [companyId, name, email || null, phone || null, address || null, birthdate || null, notes || null]
  );
  return rows[0];
}

async function ensureStock(pool, companyId, data) {
  const { name, category, quantity = 100, unit = 'un', minQuantity = 10, isAddon = false } = data;
  const existing = await pool.query('SELECT id FROM stock WHERE company_id=$1 AND name=$2 LIMIT 1', [companyId, name]);
  if (existing.rowCount > 0) {
    await pool.query(
      'UPDATE stock SET category=$1, quantity=$2, unit=$3, min_quantity=$4, is_addon=$5 WHERE id=$6',
      [category, quantity, unit, minQuantity, !!isAddon, existing.rows[0].id]
    );
    return existing.rows[0];
  }
  const { rows } = await pool.query(
    `INSERT INTO stock(company_id, name, category, quantity, unit, min_quantity, is_addon)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, name`,
    [companyId, name, category, quantity, unit, minQuantity, !!isAddon]
  );
  return rows[0];
}

async function ensureMenuItem(pool, companyId, data) {
  const { name, category, price, description, addonStockIds = [] } = data;
  const existing = await pool.query('SELECT id FROM menu_items WHERE company_id=$1 AND name=$2 LIMIT 1', [companyId, name]);
  if (existing.rowCount > 0) {
    await pool.query(
      'UPDATE menu_items SET category=$1, price=$2, description=$3, addon_stock_ids=$4 WHERE id=$5',
      [category, Number(price) || 0, description || null, addonStockIds, existing.rows[0].id]
    );
    return existing.rows[0];
  }
  const { rows } = await pool.query(
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
  return { subtotal: toMoney(subtotal), discount: toMoney(d), deliveryFee: toMoney(f), total: toMoney(total) };
}

async function ensureSeedOrder(pool, params) {
  const {
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
  } = params;

  const exists = await pool.query(
    'SELECT id FROM orders WHERE company_id=$1 AND customer_reference=$2 LIMIT 1',
    [companyId, ref]
  );
  if (exists.rowCount > 0) return { id: exists.rows[0].id, created: false };

  const totals = calcOrderTotals({ items, discount, deliveryFee });
  const { rows } = await pool.query(
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

  const orderItemIds = [];
  for (const it of items) {
    const ins = await pool.query(
      'INSERT INTO order_items(order_id, menu_item_id, quantity, price) VALUES ($1,$2,$3,$4) RETURNING id',
      [orderId, it.menuItemId, it.quantity, it.price]
    );
    orderItemIds.push({ orderItemId: ins.rows[0].id, menuItemId: it.menuItemId, quantity: it.quantity });
  }

  for (const oIt of orderItemIds) {
    const addons = Array.isArray(addonsByMenuItemId[String(oIt.menuItemId)]) ? addonsByMenuItemId[String(oIt.menuItemId)] : [];
    for (const ad of addons) {
      const stockId = Number(ad.stockId);
      const perItemQty = Number(ad.quantity) || 1;
      const totalQty = Math.max(1, perItemQty) * Math.max(1, Number(oIt.quantity) || 1);
      await pool.query(
        'UPDATE stock SET quantity = quantity - $1 WHERE company_id=$2 AND id=$3 AND quantity >= $1',
        [totalQty, companyId, stockId]
      );
      await pool.query(
        'INSERT INTO order_item_addons(order_item_id, stock_id, quantity) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
        [oIt.orderItemId, stockId, totalQty]
      );
    }
  }

  if (String(status) === 'Pago') {
    const date = new Date().toISOString().slice(0, 10);
    await pool.query(
      'INSERT INTO transactions(company_id, descricao, valor, tipo, data) VALUES ($1,$2,$3,$4,$5)',
      [companyId, `Venda ${ref}`, totals.total, 'Receita', date]
    );
  }

  return { id: orderId, created: true };
}

async function createReservation(pool, companyId, i) {
  const d = new Date();
  d.setDate(d.getDate() + (i % 10));
  const date = d.toISOString().slice(0, 10);
  const time = `${String(18 + (i % 4)).padStart(2, '0')}:00:00`;
  await pool.query(
    `INSERT INTO reservations(company_id, name, phone, date, time, people, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      companyId,
      `Reserva ${i + 1} - ${SEED_TAG}`,
      `(11) 9${String(8000 + i).padStart(4, '0')}-${String(1000 + i).slice(-4)}`,
      date,
      time,
      2 + (i % 6),
      i % 3 === 0 ? 'Confirmada' : 'Pendente',
      `Notas QA ${SEED_TAG}`,
    ]
  );
}

async function validateQaSeed(pool, companyId) {
  const counts = async (table) => {
    const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE company_id=$1`, [companyId]);
    return Number(rows?.[0]?.n) || 0;
  };

  const nCustomers = await counts('customers');
  const nMotoboys = await pool.query(
    "SELECT COUNT(*)::int AS n FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy' AND active=true",
    [companyId]
  ).then(r => Number(r.rows?.[0]?.n) || 0);

  const nOrdersMesa = await pool.query(
    "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Mesa' AND customer_reference LIKE 'QA-%'",
    [companyId]
  ).then(r => Number(r.rows?.[0]?.n) || 0);

  const nOrdersDelivery = await pool.query(
    "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Delivery' AND customer_reference LIKE 'QA-%'",
    [companyId]
  ).then(r => Number(r.rows?.[0]?.n) || 0);

  if (nCustomers < 10) throw new Error(`Seed QA inválido: esperado >=10 clientes, encontrado ${nCustomers}`);
  if (nMotoboys < 10) throw new Error(`Seed QA inválido: esperado >=10 motoboys, encontrado ${nMotoboys}`);
  if (nOrdersMesa < 10) throw new Error(`Seed QA inválido: esperado >=10 pedidos Mesa, encontrado ${nOrdersMesa}`);
  if (nOrdersDelivery < 10) throw new Error(`Seed QA inválido: esperado >=10 pedidos Delivery, encontrado ${nOrdersDelivery}`);

  const deliveriesWithoutMotoboy = await pool.query(
    "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Delivery' AND customer_reference LIKE 'QA-%' AND delivery_driver_id IS NULL",
    [companyId]
  ).then(r => Number(r.rows?.[0]?.n) || 0);
  if (deliveriesWithoutMotoboy > 0) throw new Error(`Seed QA inválido: ${deliveriesWithoutMotoboy} deliveries sem motoboy`);
}

async function run() {
  mustAllowSeed();
  const connectionString = requireEnv('DATABASE_URL');

  const allowInsecure = envFlag('ALLOW_INSECURE_SEED');
  const superPass = process.env.SEED_SUPERADMIN_PASSWORD || (allowInsecure ? 'superadmin123' : null);
  const adminPass = process.env.SEED_ADMIN_PASSWORD || (allowInsecure ? 'admin12345' : null);
  const motoboyPass = process.env.SEED_MOTOBOY_PASSWORD || (allowInsecure ? 'motoboy123' : null);

  if (!superPass) throw new Error('SEED_SUPERADMIN_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');
  if (!adminPass) throw new Error('SEED_ADMIN_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');
  if (!motoboyPass) throw new Error('SEED_MOTOBOY_PASSWORD não definida. Defina-a ou use ALLOW_INSECURE_SEED=true apenas para ambiente local.');

  const pool = buildPool(connectionString);
  try {
    await ensureSchemaExists(pool);
    await ensureOrdersMotoboyColumns(pool);

    const now = new Date();
    const trialStartAt = now;
    const trialEndAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const company = await upsertCompany(pool, {
      name: COMPANY_NAME,
      legalName: `${COMPANY_NAME} LTDA`,
      document: '12.345.678/0001-90',
      phone: '(11) 4000-1234',
      email: 'contato@empresa-qa.local',
      address: 'Av. Testes, 100 - Centro',
      active: true,
      trialStartAt,
      trialEndAt,
    });

    await upsertUser(pool, { username: 'superadmin', email: 'superadmin@local', password: superPass, role: 'superadmin', companyId: null, active: true });
    await upsertUser(pool, { username: 'admin_qa', email: 'admin_qa@local', password: adminPass, role: 'admin', companyId: company.id, active: true });

    await resetCompanyData(pool, company.id);

    // Exercita "todas as opções de cadastro" da empresa (10 execuções por variação)
    const phones = ['(11) 4000-1234', '(11) 4000-2345', '(11) 4000-3456'];
    const emails = ['contato@empresa-qa.local', 'financeiro@empresa-qa.local', 'suporte@empresa-qa.local'];
    const addresses = ['Av. Testes, 100 - Centro', 'Rua QA, 200 - Jardim', 'Praça Validação, 10 - Centro'];

    for (let i = 0; i < 10; i += 1) {
      await updateCompany(pool, company.id, {
        legalName: `${COMPANY_NAME} LTDA ${i + 1}`,
        document: `12.345.678/0001-${String(10 + i).padStart(2, '0')}`,
        phone: sample(phones, i),
        email: sample(emails, i),
        address: sample(addresses, i),
        trialStartAt: trialStartAt,
        trialEndAt: trialEndAt,
      });
    }
    for (let i = 0; i < 10; i += 1) {
      await updateCompany(pool, company.id, {
        active: i % 2 === 0,
        blockedReason: i % 2 === 0 ? null : `Bloqueio QA ${i + 1}`,
      });
    }
    // volta para ativo ao final
    await updateCompany(pool, company.id, { active: true, blockedReason: null });

    // Mesas (10)
    const tables = [];
    for (let i = 1; i <= 10; i += 1) {
      tables.push(await ensureTable(pool, company.id, `Mesa ${String(i).padStart(2, '0')}`, i % 3 === 0 ? 6 : 4));
    }

    // Estoque base (20) + addons (4)
    const addonNames = ['Queijo', 'Presunto', 'Bacon', 'Catupiry'];
    const addons = [];
    for (const n of addonNames) {
      addons.push(await ensureStock(pool, company.id, { name: n, category: 'Acompanhamentos', quantity: 300, unit: 'un', minQuantity: 30, isAddon: true }));
    }
    const addonIds = addons.map(a => Number(a.id));

    const stockBase = [
      ['Carne Bovina', 'Insumos'],
      ['Frango', 'Insumos'],
      ['Pão Brioche', 'Insumos'],
      ['Alface', 'Hortifruti'],
      ['Tomate', 'Hortifruti'],
      ['Cebola', 'Hortifruti'],
      ['Batata', 'Hortifruti'],
      ['Óleo', 'Insumos'],
      ['Refrigerante Lata', 'Bebidas'],
      ['Água', 'Bebidas'],
      ['Cerveja Long Neck', 'Bebidas'],
      ['Sorvete', 'Sobremesas'],
      ['Chocolate', 'Sobremesas'],
      ['Farinha', 'Insumos'],
      ['Ovos', 'Insumos'],
      ['Leite', 'Insumos'],
    ];

    for (let i = 0; i < stockBase.length; i += 1) {
      const [name, category] = stockBase[i];
      await ensureStock(pool, company.id, { name, category, quantity: 200, unit: 'un', minQuantity: 20, isAddon: false });
    }

    // Cardápio (12)
    const menuItems = [];
    const menuDefs = [
      ['Hambúrguer Clássico', 'Alimentos', 24.9],
      ['Hambúrguer Bacon', 'Alimentos', 29.9],
      ['Hambúrguer Gourmet', 'Alimentos', 34.9],
      ['Pastel de Queijo', 'Alimentos', 12.9],
      ['Pastel de Carne', 'Alimentos', 13.9],
      ['Crepe Doce', 'Alimentos', 16.9],
      ['Crepe Salgado', 'Alimentos', 18.9],
      ['Batata Frita', 'Alimentos', 14.9],
      ['Refrigerante', 'Bebidas', 6.5],
      ['Água', 'Bebidas', 4.0],
      ['Cerveja', 'Bebidas', 9.5],
      ['Sorvete', 'Sobremesas', 8.9],
    ];

    for (let i = 0; i < menuDefs.length; i += 1) {
      const [name, category, price] = menuDefs[i];
      const mi = await ensureMenuItem(pool, company.id, {
        name,
        category,
        price,
        description: `Item QA (${SEED_TAG})`,
        addonStockIds: category === 'Alimentos' ? addonIds : [],
      });
      menuItems.push(mi);
    }

    // Clientes (10)
    const names = [
      'Ana Oliveira', 'Bruno Santos', 'Carla Souza', 'Diego Lima', 'Eduarda Pereira',
      'Felipe Almeida', 'Gabriela Rocha', 'Henrique Costa', 'Isabela Martins', 'João Ferreira',
    ];
    const neighborhoods = ['Centro', 'Jardim', 'Vila Nova', 'Alto', 'Industrial'];
    const customers = [];
    for (let i = 0; i < 10; i += 1) {
      const customer = await ensureCustomer(pool, company.id, {
        name: names[i],
        email: `${names[i].toLowerCase().replace(/\s+/g, '.')}.${i + 1}@example.com`,
        phone: `(11) 9${String(8000 + i).padStart(4, '0')}-${String(1000 + i).slice(-4)}`,
        address: `Rua ${sample(['Flores', 'Brasil', 'Comércio', 'Acácias', 'Central'], i)}, ${100 + i} - ${sample(neighborhoods, i)}`,
        birthdate: `199${i % 10}-0${(i % 9) + 1}-1${i % 9}`,
        notes: SEED_TAG,
      });
      customers.push(customer);
    }

    // Motoboys (10) + outros operacionais (10 ações: cria 5 funções diferentes e alterna active)
    const motoboys = [];
    for (let i = 1; i <= 10; i += 1) {
      motoboys.push(await upsertUser(pool, {
        username: `motoboy_qa_${i}`,
        email: `motoboy_qa_${i}@empresa-qa.local`,
        password: motoboyPass,
        role: 'staff',
        functionName: 'Motoboy',
        companyId: company.id,
        active: true,
      }));
    }

    const operationalFunctions = ['Caixa', 'Cozinha', 'Supervisor', 'Garçom', 'Cozinha'];
    for (let i = 1; i <= 10; i += 1) {
      await upsertUser(pool, {
        username: `staff_qa_${i}`,
        email: `staff_qa_${i}@empresa-qa.local`,
        password: adminPass,
        role: 'staff',
        functionName: sample(operationalFunctions, i),
        companyId: company.id,
        active: i % 4 !== 0,
      });
    }

    // Reservas (10)
    for (let i = 0; i < 10; i += 1) {
      await createReservation(pool, company.id, i);
    }

    // Vendas: 10 Mesa + 10 Delivery
    const seedPrefix = `QA-${SEED_TAG.replace(/[^0-9A-Za-z]/g, '')}`;
    const nowIso = new Date().toISOString();

    const foodItems = menuItems.filter(m => true);
    for (let i = 0; i < 10; i += 1) {
      const table = tables[i % tables.length];
      const it1 = foodItems[i % foodItems.length];
      const it2 = foodItems[(i + 3) % foodItems.length];
      const ref = `${seedPrefix}-M${i + 1}`;
      await ensureSeedOrder(pool, {
        companyId: company.id,
        ref,
        orderType: 'Mesa',
        status: i % 3 === 0 ? 'Em Preparo' : 'Pago',
        tableId: table.id,
        customer: { name: `Mesa ${table.name}`, phone: null, address: null, neighborhood: null },
        paymentMethod: i % 2 === 0 ? 'Pix' : 'Cartão',
        deliveryFee: 0,
        discount: i % 5 === 0 ? 5.0 : 0,
        motoboyUserId: null,
        motoboyName: null,
        items: [
          { menuItemId: it1.id, quantity: 1 + (i % 2), price: 10.0 + (i % 10) },
          { menuItemId: it2.id, quantity: 1, price: 12.0 + (i % 7) },
        ],
        addonsByMenuItemId: {
          [String(it1.id)]: [{ stockId: addonIds[i % addonIds.length], quantity: 1 }],
        },
        paidAt: i % 3 === 0 ? null : nowIso,
      });
    }

    for (let i = 0; i < 10; i += 1) {
      const c = customers[i % customers.length];
      const m = motoboys[i % motoboys.length];
      const it1 = foodItems[(i + 1) % foodItems.length];
      const ref = `${seedPrefix}-D${i + 1}`;
      await ensureSeedOrder(pool, {
        companyId: company.id,
        ref,
        orderType: 'Delivery',
        status: i % 4 === 0 ? 'Saiu para Entrega' : (i % 2 === 0 ? 'Entregue' : 'Pago'),
        tableId: null,
        customer: { name: c.name, phone: c.phone, address: c.address, neighborhood: sample(neighborhoods, i) },
        paymentMethod: i % 2 === 0 ? null : 'Pix',
        deliveryFee: 6.0,
        discount: 0,
        motoboyUserId: m.id,
        motoboyName: null,
        items: [
          { menuItemId: it1.id, quantity: 1 + (i % 2), price: 18.0 + (i % 5) },
        ],
        addonsByMenuItemId: {
          [String(it1.id)]: [{ stockId: addonIds[(i + 1) % addonIds.length], quantity: 1 }],
        },
        paidAt: (i % 2 === 0) ? null : nowIso,
      });
    }

    // +10 ações no financeiro (despesas)
    for (let i = 0; i < 10; i += 1) {
      const date = new Date().toISOString().slice(0, 10);
      await pool.query(
        'INSERT INTO transactions(company_id, descricao, valor, tipo, data) VALUES ($1,$2,$3,$4,$5)',
        [company.id, `Despesa QA ${i + 1} (${SEED_TAG})`, toMoney(10 + i * 3.5), 'Despesa', date]
      );
    }

    await validateQaSeed(pool, company.id);

    console.log('✅ Seed QA concluído');
    console.log(`- company: ${company.name} (#${company.company_number})`);
    console.log(`- admin: admin_qa / ${process.env.SEED_ADMIN_PASSWORD ? '(senha via env)' : 'admin12345'}`);
    console.log(`- motoboys: motoboy_qa_1..motoboy_qa_10 / ${process.env.SEED_MOTOBOY_PASSWORD ? '(senha via env)' : 'motoboy123'}`);
    console.log(`- tag: ${SEED_TAG}`);
  } finally {
    try { await pool.end(); } catch {}
  }
}

run().catch((e) => {
  console.error('❌ Seed QA falhou:', e?.message || e);
  process.exit(1);
});
