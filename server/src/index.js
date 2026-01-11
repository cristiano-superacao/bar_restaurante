import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

// Segurança de headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS restrito via env
const allowedOrigin = process.env.CORS_ORIGIN || '*';
const corsOptions = {
  origin: allowedOrigin === '*' ? true : allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Company-Id'],
  credentials: false,
};
app.use(cors(corsOptions));

// Limite de payload
app.use(express.json({ limit: '1mb' }));

// Rate limiting global leve
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Evita 404 padrão do navegador ao tentar buscar favicon
app.get('/favicon.ico', (_req, res) => {
  res.status(204).end();
});

// Evita 404 comum de rastreadores/browsers
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow:');
});

// Rota raiz - página de status amigável
app.get('/', (_req, res) => {
  res.type('html').send(`<!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bar Restaurante API • v2.2.0</title>
    <style>
      :root {
        --bg: #0b1b3a;
        --bg-soft: #0f2a5a;
        --accent: #1a73e8;
        --accent-soft: rgba(26, 115, 232, 0.12);
        --text-main: #f9fafb;
        --text-muted: #9ca3af;
        --card-bg: rgba(15, 23, 42, 0.92);
        --radius-xl: 20px;
        --shadow-xl: 0 22px 70px rgba(15, 23, 42, 0.6);
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        min-height: 100vh;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        background: radial-gradient(circle at top left, #1d4ed8, #020617 55%);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 24px;
      }

      .shell {
        width: 100%;
        max-width: 880px;
        background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94));
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl);
        border: 1px solid rgba(148, 163, 184, 0.25);
        padding: 22px 22px 18px;
      }

      .shell-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 18px;
      }

      .title-block {
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 0;
      }

      .badge-icon {
        width: 42px;
        height: 42px;
        border-radius: 14px;
        background: radial-gradient(circle at 30% 0%, #60a5fa, #1d4ed8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
      }

      h1 {
        font-size: clamp(1.15rem, 1.4rem, 1.6rem);
        letter-spacing: -0.03em;
      }

      .muted {
        color: var(--text-muted);
        font-size: 0.82rem;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: #022c22;
        color: #6ee7b7;
        font-size: 0.78rem;
        border: 1px solid rgba(34, 197, 94, 0.35);
      }

      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: #22c55e;
        box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.25);
      }

      .grid {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        gap: 18px;
      }

      .card {
        background: var(--card-bg);
        border-radius: 16px;
        padding: 16px 18px 14px;
        border: 1px solid rgba(148, 163, 184, 0.25);
      }

      .card h2 {
        font-size: 0.9rem;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--text-muted);
      }

      dl { display: grid; grid-template-columns: auto minmax(0, 1fr); row-gap: 6px; column-gap: 10px; }
      dt { font-size: 0.8rem; color: var(--text-muted); }
      dd { font-size: 0.88rem; }

      code {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
        font-size: 0.78rem;
        padding: 2px 6px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(30, 64, 175, 0.7);
        color: #bfdbfe;
      }

      ul { list-style: none; display: grid; gap: 6px; font-size: 0.86rem; }
      li span { color: var(--text-muted); font-size: 0.8rem; }

      .links {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 10px;
      }

      a.button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 14px;
        border-radius: 999px;
        font-size: 0.82rem;
        text-decoration: none;
        border: 1px solid rgba(59, 130, 246, 0.6);
        background: radial-gradient(circle at top left, rgba(59, 130, 246, 0.32), rgba(15, 23, 42, 0.9));
        color: #e5f0ff;
      }

      a.button.secondary {
        border-color: rgba(148, 163, 184, 0.7);
        background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.15), rgba(15, 23, 42, 0.96));
        color: #e5e7eb;
      }

      a.button:hover {
        border-color: #60a5fa;
      }

      footer {
        margin-top: 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        color: var(--text-muted);
      }

      @media (max-width: 720px) {
        .shell { padding: 18px 16px 14px; }
        .shell-header { flex-direction: column; align-items: flex-start; }
        .grid { grid-template-columns: minmax(0, 1fr); }
        footer { flex-direction: column; align-items: flex-start; gap: 6px; }
      }
    </style>
  </head>
  <body>
    <main class="shell" aria-label="Status da API Bar Restaurante">
      <header class="shell-header">
        <div class="title-block">
          <div class="badge-icon" aria-hidden="true">🍽️</div>
          <div>
            <h1>Bar Restaurante API</h1>
            <p class="muted">Serviço backend para autenticação, pedidos, mesas, estoque e financeiro.</p>
          </div>
        </div>
        <div class="status-pill" aria-label="Status da API: online">
          <span class="dot" aria-hidden="true"></span>
          <span>Online • v2.2.0</span>
        </div>
      </header>

      <section class="grid" aria-label="Informações da API">
        <article class="card">
          <h2>Visão Geral</h2>
          <dl>
            <dt>Ambiente</dt>
            <dd>Produção (Railway + PostgreSQL)</dd>
            <dt>Health check</dt>
            <dd><code>GET /health</code></dd>
            <dt>Endpoint base</dt>
            <dd><code>/api</code></dd>
          </dl>
          <div class="links" aria-label="Acessos rápidos">
            <a class="button" href="/api" target="_blank" rel="noopener noreferrer">📘 Ver endpoints JSON</a>
            <a class="button secondary" href="https://barestaurante.netlify.app" target="_blank" rel="noopener noreferrer">🌐 Abrir painel do sistema</a>
          </div>
        </article>

        <article class="card">
          <h2>Principais rotas</h2>
          <ul>
            <li><code>POST /api/auth/login</code><br><span>Autenticação com JWT</span></li>
            <li><code>GET /api/tables</code><br><span>Mesas por empresa</span></li>
            <li><code>GET /api/orders</code><br><span>Pedidos (mesa e delivery)</span></li>
            <li><code>GET /api/stock</code><br><span>Estoque e insumos</span></li>
            <li><code>GET /api/transactions</code><br><span>Financeiro / fluxo de caixa</span></li>
          </ul>
        </article>
      </section>

      <footer>
        <span>Maria Flor • API de gestão para bares e restaurantes</span>
        <span>Docs JSON: <code>GET /api</code></span>
      </footer>
    </main>
  </body>
  </html>`);
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

// Rate limit mais restrito para login
const authLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.use('/api/auth', authLimiter, authRoutes);
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

