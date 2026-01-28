import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function buildPool(connectionString) {
  const isProd = process.env.NODE_ENV === 'production';
  const sslConfig = process.env.DATABASE_SSL === 'false' ? false : (isProd ? { rejectUnauthorized: false } : false);
  return new Pool({ connectionString, ssl: sslConfig });
}

async function getCompany(pool, name) {
  const { rows } = await pool.query('SELECT id, name, company_number, active FROM companies WHERE name=$1 LIMIT 1', [name]);
  return rows[0] || null;
}

async function countByCompany(pool, table, companyId) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE company_id=$1`, [companyId]);
  return Number(rows?.[0]?.n) || 0;
}

async function run() {
  const dbUrl = requireEnv('DATABASE_URL');
  const companyName = process.env.SEED_QA_COMPANY_NAME || 'Empresa QA';

  const pool = buildPool(dbUrl);
  try {
    const company = await getCompany(pool, companyName);
    if (!company) {
      throw new Error(`Empresa não encontrada: ${companyName}`);
    }

    const [
      customers,
      menuItems,
      stock,
      tables,
      reservations,
      orders,
      transactions,
    ] = await Promise.all([
      countByCompany(pool, 'customers', company.id),
      countByCompany(pool, 'menu_items', company.id),
      countByCompany(pool, 'stock', company.id),
      countByCompany(pool, 'tables', company.id),
      countByCompany(pool, 'reservations', company.id),
      countByCompany(pool, 'orders', company.id),
      countByCompany(pool, 'transactions', company.id),
    ]);

    const motoboys = await pool.query(
      "SELECT COUNT(*)::int AS n FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy' AND active=true",
      [company.id]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    const deliveries = await pool.query(
      "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Delivery' AND customer_reference LIKE 'QA-%'",
      [company.id]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    const mesa = await pool.query(
      "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Mesa' AND customer_reference LIKE 'QA-%'",
      [company.id]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    const deliveriesWithoutMotoboy = await pool.query(
      "SELECT COUNT(*)::int AS n FROM orders WHERE company_id=$1 AND order_type='Delivery' AND customer_reference LIKE 'QA-%' AND delivery_driver_id IS NULL",
      [company.id]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    const ok = [
      { label: 'clientes >= 10', value: customers, pass: customers >= 10 },
      { label: 'motoboys >= 10', value: motoboys, pass: motoboys >= 10 },
      { label: 'pedidos mesa >= 10', value: mesa, pass: mesa >= 10 },
      { label: 'deliveries >= 10', value: deliveries, pass: deliveries >= 10 },
      { label: 'deliveries com motoboy', value: deliveriesWithoutMotoboy, pass: deliveriesWithoutMotoboy === 0 },
    ];

    console.log(`\nQA report - ${company.name} (#${company.company_number})`);
    console.log(`- active: ${company.active}`);
    console.log(`- customers: ${customers}`);
    console.log(`- motoboys: ${motoboys}`);
    console.log(`- menu_items: ${menuItems}`);
    console.log(`- stock: ${stock}`);
    console.log(`- tables: ${tables}`);
    console.log(`- reservations: ${reservations}`);
    console.log(`- orders(total): ${orders} (mesa QA: ${mesa}, delivery QA: ${deliveries})`);
    console.log(`- transactions: ${transactions}`);

    for (const r of ok) {
      if (!r.pass) {
        console.error(`❌ check falhou: ${r.label} (valor: ${r.value})`);
        process.exitCode = 2;
      }
    }

    if (!process.exitCode) {
      console.log('\n✅ checks OK');
    }
  } finally {
    try { await pool.end(); } catch {}
  }
}

run().catch((e) => {
  console.error('❌ QA report falhou:', e?.message || e);
  process.exit(1);
});
