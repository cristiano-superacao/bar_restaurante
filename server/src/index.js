import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'DB connection failed' });
  }
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API rodando na porta ${port}`));
