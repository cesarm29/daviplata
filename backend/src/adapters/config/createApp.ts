import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createContainer } from './DependencyInjection';

export function createApp() {
  const app = express();
  const container = createContainer();

  app.use(cors({
    origin: [
      'https://daviplata-app.vercel.app',
      'https://daviplata-api.vercel.app',
      /\.daviplata-app\.vercel\.app$/,
    ],
    credentials: true,
  }));
  app.use(helmet({
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());
  app.use(express.json());

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Demasiadas solicitudes' },
  });
  app.use('/api/', limiter);

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.post('/api/auth/login', container.authController.login);
  app.post('/api/auth/register', container.authController.register);
  app.post('/api/auth/logout', container.authMiddleware.handle, container.authController.logout);

  app.get('/api/accounts/balance', container.authMiddleware.handle, container.accountController.getBalance);
  app.get('/api/accounts/me', container.authMiddleware.handle, container.accountController.getByUser);

  app.post('/api/transactions/transfer', container.authMiddleware.handle, container.transactionController.transfer);
  app.get('/api/transactions/movements', container.authMiddleware.handle, container.transactionController.getMovements);

  app.post('/api/dev/set-balance', async (req, res) => {
    try {
      const { email, balance } = req.body;
      if (!email || balance === undefined) {
        return res.status(400).json({ message: 'email and balance required' });
      }
      const { queryOne } = await import('../../outbound/persistence/DatabaseConnection');
      const user = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email]);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      await queryOne('UPDATE accounts SET balance = $1, updated_at = NOW() WHERE user_id = $2', [balance, user.id]);
      res.status(200).json({ message: 'Balance updated', email, balance });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post('/api/dev/set-balance-all', async (_req, res) => {
    try {
      const { queryOne } = await import('../../outbound/persistence/DatabaseConnection');
      await queryOne('UPDATE accounts SET balance = 5000000, updated_at = NOW()');
      res.status(200).json({ message: 'All balances set to 5,000,000' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return app;
}
