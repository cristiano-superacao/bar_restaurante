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

async function getCompanyId(pool, companyName) {
  const { rows } = await pool.query('SELECT id FROM companies WHERE name=$1 LIMIT 1', [companyName]);
  return rows?.[0]?.id ?? null;
}

async function count(pool, table, companyId) {
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE company_id=$1`, [companyId]);
  return Number(rows?.[0]?.n) || 0;
}

async function run() {
  const localUrl = requireEnv('LOCAL_DATABASE_URL');
  const railwayUrl = requireEnv('RAILWAY_DATABASE_URL');
  const companyName = process.env.SEED_QA_COMPANY_NAME || 'Empresa QA';

  const local = buildPool(localUrl);
  const remote = buildPool(railwayUrl);

  try {
    const [localCompanyId, remoteCompanyId] = await Promise.all([
      getCompanyId(local, companyName),
      getCompanyId(remote, companyName),
    ]);

    if (!localCompanyId) throw new Error(`Empresa não encontrada no LOCAL: ${companyName}`);
    if (!remoteCompanyId) throw new Error(`Empresa não encontrada no RAILWAY: ${companyName}`);

    const tables = ['customers', 'menu_items', 'stock', 'tables', 'reservations', 'orders', 'transactions'];
    const results = [];

    for (const t of tables) {
      const [a, b] = await Promise.all([
        count(local, t, localCompanyId),
        count(remote, t, remoteCompanyId),
      ]);
      results.push({ table: t, local: a, railway: b, equal: a === b });
    }

    const motoboysLocal = await local.query(
      "SELECT COUNT(*)::int AS n FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy' AND active=true",
      [localCompanyId]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    const motoboysRailway = await remote.query(
      "SELECT COUNT(*)::int AS n FROM users WHERE company_id=$1 AND role='staff' AND LOWER(COALESCE(function,''))='motoboy' AND active=true",
      [remoteCompanyId]
    ).then(r => Number(r.rows?.[0]?.n) || 0);

    results.push({ table: 'motoboys(users)', local: motoboysLocal, railway: motoboysRailway, equal: motoboysLocal === motoboysRailway });

    console.log(`\nQA compare - ${companyName}`);
    let hasDiff = false;
    for (const r of results) {
      const line = `- ${r.table}: local=${r.local} / railway=${r.railway}`;
      if (!r.equal) {
        hasDiff = true;
        console.error(`❌ ${line}`);
      } else {
        console.log(`✅ ${line}`);
      }
    }

    if (hasDiff) {
      process.exitCode = 2;
      console.error('\nDiferenças encontradas. Se o objetivo é igualdade exata, rode o mesmo seed nos dois bancos com os mesmos envs (ou use SEED_RESET=true antes).');
    } else {
      console.log('\n✅ Local e Railway batem nos principais contadores');
    }
  } finally {
    try { await local.end(); } catch {}
    try { await remote.end(); } catch {}
  }
}

run().catch((e) => {
  console.error('❌ QA compare falhou:', e?.message || e);
  process.exit(1);
});
