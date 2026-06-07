import redis from '../utils/redis.js';

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const { subscriptionId, requestsPerMin } = req.gatewayContext;

    if (!subscriptionId || !requestsPerMin) {
      return res.status(500).json({ error: 'Gateway context missing registration details' });
    }

    // Get current minute timestamp (e.g., 2026-06-07T20:56)
    const now = new Date();
    const minuteTimestamp = now.toISOString().substring(0, 16);
    const rateKey = `rate:sub:${subscriptionId}:${minuteTimestamp}`;

    // Increment request counter
    const currentCount = await redis.incr(rateKey);

    // Set TTL on key creation
    if (currentCount === 1) {
      await redis.expire(rateKey, 120);
    }

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', requestsPerMin);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, requestsPerMin - currentCount));

    if (currentCount > requestsPerMin) {
      const secondsLeft = 60 - now.getSeconds();
      res.setHeader('Retry-After', secondsLeft);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfterSeconds: secondsLeft,
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiting middleware error:', error);
    // Fail open or fail closed? Fail closed is safer, but let's log and proceed or fail open.
    // For API marketplaces, failing closed on Redis issues prevents abuse, but failing open ensures uptime.
    // Let's fail open to ensure high availability, or return 500. Let's return 500 for strict enforcement.
    res.status(500).json({ error: 'Internal rate limiting verification error' });
  }
};

export default rateLimiterMiddleware;
