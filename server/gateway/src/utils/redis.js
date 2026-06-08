import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

// Define token bucket Lua script for atomic rate limiting
redis.defineCommand('tokenBucket', {
  numberOfKeys: 1,
  lua: `
    local key = KEYS[1]
    local capacity = tonumber(ARGV[1])
    local refill_rate = tonumber(ARGV[2])
    local now = tonumber(ARGV[3])
    local requested = tonumber(ARGV[4])

    local data = redis.call("HMGET", key, "tokens", "lastUpdated")
    local tokens = tonumber(data[1])
    local last_updated = tonumber(data[2])

    if not tokens then
      tokens = capacity
      last_updated = now
    else
      local elapsed = now - last_updated
      if elapsed > 0 then
        local new_tokens = tokens + (elapsed * refill_rate)
        if new_tokens > capacity then
          tokens = capacity
        else
          tokens = new_tokens
        end
        last_updated = now
      end
    end

    local allowed = 0
    if tokens >= requested then
      allowed = 1
      tokens = tokens - requested
      redis.call("HMSET", key, "tokens", tostring(tokens), "lastUpdated", tostring(last_updated))
      redis.call("EXPIRE", key, 120)
    else
      redis.call("HMSET", key, "tokens", tostring(tokens), "lastUpdated", tostring(last_updated))
      redis.call("EXPIRE", key, 120)
    end

    return { allowed, tostring(tokens) }
  `
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
