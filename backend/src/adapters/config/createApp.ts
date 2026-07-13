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

  return app;
}
