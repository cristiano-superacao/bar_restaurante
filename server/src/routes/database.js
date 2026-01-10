import express from 'express';
import { query } from '../db.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// Somente superadmin pode acessar info de database
router.use(requireRole(['superadmin']));

router.get('/info', async (_req, res) => {
  try {
    // Lista todas as tabelas
    const tables = await query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    // Conta registros em cada tabela
    const counts = {};
    for (const t of tables.rows) {
      try {
        const r = await query(`SELECT COUNT(*) as count FROM ${t.tablename}`);
        counts[t.tablename] = Number(r.rows[0]?.count) || 0;
      } catch {
        counts[t.tablename] = 'N/A';
      }
    }

    res.json({
      tables: tables.rows.map(t => t.tablename),
      counts,
      version: (await query('SELECT version()')).rows[0].version
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter info do database' });
  }
});

router.get('/schema/:table', async (req, res) => {
  try {
    const { table } = req.params;
    const columns = await query(`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [table]);

    if (columns.rowCount === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }

    res.json({
      table,
      columns: columns.rows
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao obter schema da tabela' });
  }
});

export default router;
