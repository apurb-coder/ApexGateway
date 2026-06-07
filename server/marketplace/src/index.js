import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Marketplace Service running on port ${PORT}`);
});
