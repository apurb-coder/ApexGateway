import crypto from 'crypto';
import redis from '../utils/redis.js';
import prisma from '../utils/prisma.js';

const authMiddleware = async (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing X-API-Key header' });
    }

    // Hash API key
    const hash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const cacheKey = `auth:key:${hash}`;

    // 1. Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    let authInfo;
    if (cachedData) {
      authInfo = JSON.parse(cachedData);
      if (!authInfo.isActive) {
        return res.status(403).json({ error: 'Inactive or invalid subscription' });
      }
    } else {
      // 2. Database Fallback
      const subscription = await prisma.subscription.findUnique({
        where: { apiKeyHash: hash },
        include: {
          plan: {
            include: {
              api: true,
            },
          },
        },
      });

      if (!subscription || !subscription.isActive) {
        // Cache negative lookup to prevent DB hammering
        await redis.setex(cacheKey, 60, JSON.stringify({ isActive: false }));
        return res.status(401).json({ error: 'Invalid or inactive subscription' });
      }

      const api = subscription.plan.api;
      if (api.status === 'INACTIVE') {
        return res.status(503).json({ error: 'API service is currently inactive' });
      }

      // 3. Construct Auth Context
      authInfo = {
        subscriptionId: subscription.id,
        planId: subscription.planId,
        requestsPerMin: subscription.plan.requestsPerMin,
        upstreamUrl: api.upstreamUrl,
        apiName: api.name,
        apiId: api.id,
        allowedMethods: api.allowedMethods,
        isActive: true,
      };

      // Cache in Redis for 5 minutes (300 seconds)
      await redis.setex(cacheKey, 300, JSON.stringify(authInfo));
    }

    // 4. Verify HTTP method
    const reqMethod = req.method.toUpperCase();
    const allowed = authInfo.allowedMethods || [];
    const finalAllowed = allowed.length > 0 ? allowed : ['GET', 'POST', 'PUT', 'DELETE'];
    if (!finalAllowed.map(m => m.toUpperCase()).includes(reqMethod)) {
      return res.status(405).json({ error: `Method ${reqMethod} is not allowed for this API` });
    }

    req.gatewayContext = authInfo;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Internal gateway authentication error' });
  }
};

export default authMiddleware;
