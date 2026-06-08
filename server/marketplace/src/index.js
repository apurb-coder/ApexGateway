import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json({ limit: '2mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'marketplace-api' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/apis', apiRoutes);
app.use('/subscriptions', subscriptionRoutes);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Marketplace Service running on port ${PORT}`);
});
