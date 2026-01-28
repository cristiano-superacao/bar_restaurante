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

async function upsertUser({ username, email, password, role, companyId = null, active = true }) {
  const passwordHash = await bcrypt.hash(String(password), 10);
  const { rows } = await query(
    `INSERT INTO users(username, email, password_hash, role, company_id, active)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (username) DO UPDATE SET
       email=EXCLUDED.email,
       password_hash=EXCLUDED.password_hash,
       role=EXCLUDED.role,
       company_id=EXCLUDED.company_id,
       active=EXCLUDED.active
     RETURNING id, username, email, role, company_id, active`,
    [username, email, passwordHash, role, companyId, !!active]
  );
  return rows[0];
}

async function seedDemoData(companyId) {
  // Só popula se não tiver nada básico ainda
  const existing = await query('SELECT COUNT(*)::int AS n FROM menu_items WHERE company_id=$1', [companyId]);
  if ((existing.rows?.[0]?.n ?? 0) > 0) return;

  // Cardápio
  const burger = await query(
    `INSERT INTO menu_items(company_id, name, category, price, description)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [companyId, 'Hambúrguer Artesanal', 'Lanches', 29.9, 'Pão brioche, carne 160g, queijo, molho da casa']
  );
  const soda = await query(
    `INSERT INTO menu_items(company_id, name, category, price, description)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING id`,
    [companyId, 'Refrigerante Lata', 'Bebidas', 6.5, '350ml']
  );

  // Mesas
  const table = await query(
    `INSERT INTO tables(company_id, name, capacity, status)
     VALUES ($1,$2,$3,$4)
     RETURNING id`,
    [companyId, 'Mesa 01', 4, 'Livre']
  );

  // Estoque
  await query(
    `INSERT INTO stock(company_id, name, category, quantity, unit, min_quantity, is_addon)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [companyId, 'Batata Palito', 'Acompanhamentos', 50, 'un', 10, true]
  );

  // Cliente
  const customer = await query(
    `INSERT INTO customers(company_id, name, email, phone, address, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [companyId, 'Cliente Demo', 'cliente@demo.local', '(11) 99999-0000', 'Rua Exemplo, 123', 'Seed']
  );

  // Pedido + itens
  const order = await query(
    `INSERT INTO orders(company_id, table_id, status, order_type, customer_name, customer_phone, subtotal, total)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id`,
    [companyId, table.rows[0].id, 'Pendente', 'Mesa', 'Cliente Demo', '(11) 99999-0000', 36.4, 36.4]
  );

  await query(
    `INSERT INTO order_items(order_id, menu_item_id, quantity, price)
     VALUES ($1,$2,$3,$4)`,
    [order.rows[0].id, burger.rows[0].id, 1, 29.9]
  );

  await query(
    `INSERT INTO order_items(order_id, menu_item_id, quantity, price)
     VALUES ($1,$2,$3,$4)`,
    [order.rows[0].id, soda.rows[0].id, 1, 6.5]
  );
}

async function run() {
  mustAllowSeed();
  requireEnv('DATABASE_URL');

  await ensureSchemaExists();

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

  await seedDemoData(demo.id);

  console.log('✅ Seed concluído');
  console.log(`- superadmin: superadmin / ${process.env.SEED_SUPERADMIN_PASSWORD ? '(senha via env)' : 'superadmin123'}`);
  console.log(`- admin_demo: admin_demo / ${process.env.SEED_ADMIN_PASSWORD ? '(senha via env)' : 'admin12345'}`);
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
