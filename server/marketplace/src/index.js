import './bootstrap.js';

import crypto from 'node:crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto || crypto;
}
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Stripe Webhook needs raw body, mount BEFORE express.json()
import { stripeWebhook } from './controllers/paymentController.js';
app.post('/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'marketplace-api' });
});

import paymentRoutes from './routes/paymentRoutes.js';

// Mount routes
app.use('/auth', authRoutes);
app.use('/apis', apiRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use('/payments', paymentRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Marketplace Service running on port ${PORT}`);
});
