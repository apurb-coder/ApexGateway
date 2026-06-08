import { test } from 'node:test';
import assert from 'node:assert';

const MARKETPLACE_URL = process.env.MARKETPLACE_URL || 'http://localhost:3000';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

test('Token Bucket Rate Limiter - Stress Test & Edge Cases', async (t) => {
  const suffix = Date.now();
  const providerEmail = `provider_rate_${suffix}@example.com`;
  const consumerEmail = `consumer_rate_${suffix}@example.com`;
  const password = 'Password123!';
  
  let providerToken;
  let apiId;
  let planId;
  let consumerToken;
  let apiKey;
  const apiName = `weather-rate-test-${suffix}`;

  // 1. Setup Provider & API & Plan
  await t.test('Setup provider, API, and Plan with limit = 5 req/min', async () => {
    // Register
    let res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password, role: 'PROVIDER' })
    });
    assert.strictEqual(res.status, 201);

    // Login
    res = await fetch(`${MARKETPLACE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password })
    });
    assert.strictEqual(res.status, 200);
    const loginData = await res.json();
    providerToken = loginData.token;

    // Create API (pointing to marketplace health check as mock upstream)
    res = await fetch(`${MARKETPLACE_URL}/apis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        name: apiName,
        description: 'Testing rate limit',
        upstreamUrl: 'http://marketplace-api:3000'
      })
    });
    assert.strictEqual(res.status, 201);
    const apiData = await res.json();
    apiId = apiData.api.id;

    // Create Plan (requestsPerMin = 5)
    res = await fetch(`${MARKETPLACE_URL}/apis/${apiId}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        name: 'Strict Limit Plan',
        requestsPerMin: 5,
        price: 0.0
      })
    });
    assert.strictEqual(res.status, 201);
    const planData = await res.json();
    planId = planData.plan.id;
  });

  // 2. Setup Consumer & Subscribe
  await t.test('Setup consumer and Subscribe to Plan', async () => {
    // Register
    let res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumerEmail, password, role: 'CONSUMER' })
    });
    assert.strictEqual(res.status, 201);

    // Login
    res = await fetch(`${MARKETPLACE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumerEmail, password })
    });
    assert.strictEqual(res.status, 200);
    const loginData = await res.json();
    consumerToken = loginData.token;

    // Subscribe
    res = await fetch(`${MARKETPLACE_URL}/subscriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${consumerToken}`
      },
      body: JSON.stringify({ planId })
    });
    assert.strictEqual(res.status, 201);
    const subData = await res.json();
    apiKey = subData.apiKey;
    assert.ok(apiKey);
  });

  // 3. Stress testing the rate limiter (capacity = 5)
  await t.test('Send 8 concurrent requests - expect 5 success, 3 rate-limited (429)', async () => {
    // We send them concurrently
    const reqs = Array.from({ length: 8 }).map(() =>
      fetch(`${GATEWAY_URL}/api/${apiName}/health`, {
        headers: { 'X-API-Key': apiKey }
      })
    );

    const responses = await Promise.all(reqs);

    const statuses = responses.map(r => r.status);
    const successCount = statuses.filter(s => s === 200).length;
    const rateLimitedCount = statuses.filter(s => s === 429).length;

    console.log(`Concurrent test results: Success = ${successCount}, 429 = ${rateLimitedCount}`);
    
    // With token bucket, all concurrent requests processed in the same millisecond/second
    // should consume the bucket of capacity 5. Exactly 5 should be 200, 3 should be 429.
    assert.strictEqual(successCount, 5);
    assert.strictEqual(rateLimitedCount, 3);

    // Verify rate limit headers of one of the 429 responses
    const rateLimitedResponse = responses.find(r => r.status === 429);
    assert.ok(rateLimitedResponse);
    assert.strictEqual(rateLimitedResponse.headers.get('x-ratelimit-limit'), '5');
    assert.strictEqual(rateLimitedResponse.headers.get('x-ratelimit-remaining'), '0');
    assert.ok(rateLimitedResponse.headers.get('retry-after'));

    const body = await rateLimitedResponse.json();
    assert.strictEqual(body.error, 'Too Many Requests');
    assert.ok(body.retryAfterSeconds);
  });
});
