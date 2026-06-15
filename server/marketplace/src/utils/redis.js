import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

redis.on('connect', () => {
  console.log('Marketplace connected to Redis');
});

redis.on('error', (err) => {
  console.error('Marketplace Redis connection error:', err);
});

export default redis;
