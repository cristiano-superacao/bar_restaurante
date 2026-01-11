import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function dropPublicSchema() {
  try {
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    return true;
  } catch (err) {
    console.warn('Não foi possível recriar o schema public diretamente, tentando dropar objetos individualmente...', err.message);
    return false;
  }
}

async function dropObjectsIndividually() {
  // Drop views
  const views = await pool.query(`SELECT table_schema, table_name FROM information_schema.views WHERE table_schema='public'`);
  for (const v of views.rows) {
    await pool.query(`DROP VIEW IF EXISTS "${v.table_schema}"."${v.table_name}" CASCADE;`);
  }
  // Drop tables
  const tables = await pool.query(`SELECT schemaname AS table_schema, tablename AS table_name FROM pg_tables WHERE schemaname='public'`);
  for (const t of tables.rows) {
    await pool.query(`DROP TABLE IF EXISTS "${t.table_schema}"."${t.table_name}" CASCADE;`);
  }
  // Drop sequences
  const sequences = await pool.query(`SELECT sequence_schema, sequence_name FROM information_schema.sequences WHERE sequence_schema='public'`);
  for (const s of sequences.rows) {
    await pool.query(`DROP SEQUENCE IF EXISTS "${s.sequence_schema}"."${s.sequence_name}" CASCADE;`);
  }
}

async function applySchema() {
  const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
}

async function run() {
  console.log('Reconstruindo banco com DATABASE_URL=', process.env.DATABASE_URL);
  const dropped = await dropPublicSchema();
  if (!dropped) {
    await dropObjectsIndividually();
  }
  await applySchema();
  console.log('Banco reconstruído com sucesso.');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
