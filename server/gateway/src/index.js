import 'dotenv/config';

if (process.env.DB_HOST && process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.DATABASE_URL
    .replace('localhost', process.env.DB_HOST)
    .replace('5433', process.env.DB_PORT || '5432');
}
if (process.env.REDIS_HOST && process.env.REDIS_URL) {
  process.env.REDIS_URL = process.env.REDIS_URL
    .replace('localhost', process.env.REDIS_HOST)
    .replace('6379', process.env.REDIS_PORT || '6379');
}

import express from 'express';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import authMiddleware from './middlewares/auth.js';
import rateLimiterMiddleware from './middlewares/rateLimiter.js';
import redis from './utils/redis.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Security Middleware (Note: Helmet is configured, but we disable contentSecurityPolicy for API proxying if needed.
// However, since it is an API Gateway, simple Helmet is fine.
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

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'gateway-proxy' });
});

// Proxy Request Logging Middleware (Analytics)
app.use('/api/:apiName', (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    // Only log if auth context was established
    if (req.gatewayContext) {
      const latencyMs = Date.now() - startTime;
      const analyticsLog = {
        apiName: req.gatewayContext.apiName,
        subscriptionId: req.gatewayContext.subscriptionId,
        statusCode: res.statusCode,
        latencyMs,
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
        method: req.method,
      };

      // Push to Redis List queue asynchronously
      redis.lpush('queue:analytics', JSON.stringify(analyticsLog)).catch((err) => {
        console.error('Failed to enqueue analytics log:', err);
      });
    }
  });

  next();
});

// Dynamic HTTP Proxy Middleware
const apiProxy = createProxyMiddleware({
  router: (req) => {
    if (req.gatewayContext && req.gatewayContext.upstreamUrl) {
      return req.gatewayContext.upstreamUrl;
    }
    return null;
  },
  pathRewrite: (path, req) => {
    // Strip '/api/:apiName' from the start of the path
    // e.g. /api/weather-service/v1/forecast -> /v1/forecast
    const match = path.match(/^\/api\/[^/]+/);
    if (match) {
      const rewritten = path.replace(match[0], '');
      return rewritten || '/';
    }
    return path;
  },
  changeOrigin: true,
  // Handle proxy errors
  onError: (err, req, res) => {
    console.error('Proxy Error:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad Gateway', message: 'Failed to connect to the target upstream service.' });
    }
  },
});

// Mount routes
app.use(
  '/api/:apiName',
  authMiddleware,
  rateLimiterMiddleware,
  (req, res, next) => {
    // Strip gateway-specific headers before proxying to prevent upstream errors
    delete req.headers['x-api-key'];
    delete req.headers['authorization'];
    next();
  },
  apiProxy
);

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Gateway Proxy Service running on port ${PORT}`);
});
