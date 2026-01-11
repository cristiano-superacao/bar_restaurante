import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import url from 'url';
import { pool } from './db.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menuItems.js';
import tableRoutes from './routes/tables.js';
import orderRoutes from './routes/orders.js';
import stockRoutes from './routes/stock.js';
import transactionRoutes from './routes/transactions.js';
import companyRoutes from './routes/companies.js';
import userRoutes from './routes/users.js';
import customerRoutes from './routes/customers.js';
import reservationRoutes from './routes/reservations.js';
import databaseRoutes from './routes/database.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Evita 404 padrão do navegador ao tentar buscar favicon
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// Evita 404 comum de rastreadores/browsers
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow:');
});

// Rota raiz
app.get('/', (_req, res) => {
  res.json({
    name: 'Bar Restaurante API',
    version: '2.2.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/login',
      docs: '/api',
    }
  });
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
});

// Info de API
app.get('/api', (_req, res) => {
  res.json({
    name: 'Bar Restaurante API',
    version: '2.2.0',
    endpoints: [
      'POST /api/auth/login',
      'GET /api/companies (auth)',
      'GET /api/users (auth)',
      'GET /api/menu-items (auth)',
      'GET /api/tables (auth)',
      'GET /api/orders (auth)',
      'GET /api/stock (auth)',
      'GET /api/customers (auth)',
      'GET /api/reservations (auth)',
      'GET /api/transactions (auth)',
      'GET /api/database/info (superadmin)',
    ]
  });
});

app.use('/api/auth', authRoutes);
// Protege as rotas a seguir com JWT
app.use('/api/companies', requireAuth, companyRoutes);
app.use('/api/users', requireAuth, userRoutes);
app.use('/api/menu-items', requireAuth, menuRoutes);
app.use('/api/tables', requireAuth, tableRoutes);
app.use('/api/orders', requireAuth, orderRoutes);
app.use('/api/stock', requireAuth, stockRoutes);
app.use('/api/transactions', requireAuth, transactionRoutes);
app.use('/api/customers', requireAuth, customerRoutes);
app.use('/api/reservations', requireAuth, reservationRoutes);
app.use('/api/database', requireAuth, databaseRoutes);

// Função para executar migrações automaticamente
async function runMigrations() {
  try {
    console.log('🔄 Executando migrações do banco de dados...');
    const schemaPath = path.join(__dirname, 'migrations', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(sql);
    console.log('✅ Migrações aplicadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Inicializa o servidor após executar migrações
const port = process.env.PORT || 3000;

runMigrations()
  .then(() => {
    app.listen(port, () => {
      console.log(`🚀 API rodando na porta ${port}`);
      console.log(`📊 Database: ${process.env.DATABASE_URL ? 'PostgreSQL (Railway)' : 'Local'}`);
    });
  })
  .catch((error) => {
    console.error('💥 Falha ao inicializar servidor:', error);
    process.exit(1);
  });

