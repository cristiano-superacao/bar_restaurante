import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from './db.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

async function run() {
  const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf-8');
  await pool.query(sql);
  console.log('Schema aplicado com sucesso');
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });
