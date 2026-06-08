import redis from '../utils/redis.js';

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    const { subscriptionId, requestsPerMin } = req.gatewayContext;

    if (!subscriptionId || !requestsPerMin) {
      return res.status(500).json({ error: 'Gateway context missing registration details' });
    }

    const rateKey = `rate:sub:${subscriptionId}:tb`;
    const capacity = requestsPerMin;
    const refillRate = capacity / 60000; // tokens per millisecond
    const now = Date.now();
    const requested = 1;

    // Call custom Token Bucket Redis command
    const [allowed, tokensStr] = await redis.tokenBucket(rateKey, capacity, refillRate, now, requested);
    const remainingTokens = parseFloat(tokensStr);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', capacity);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, Math.floor(remainingTokens)));

    if (allowed !== 1) {
      const deficit = requested - remainingTokens;
      const timeToWaitMs = deficit / refillRate;
      const secondsLeft = Math.max(1, Math.ceil(timeToWaitMs / 1000));

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
    res.status(500).json({ error: 'Internal rate limiting verification error' });
  }
};

export default rateLimiterMiddleware;
