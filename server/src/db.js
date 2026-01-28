import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;

const isProd = process.env.NODE_ENV === 'production';
const sslConfig = process.env.DATABASE_SSL === 'false' ? false : (isProd ? { rejectUnauthorized: false } : false);
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.LOG_SQL === 'true') {
    console.log('executed query', { text, duration, rows: res.rowCount });
  }
  return res;
}

