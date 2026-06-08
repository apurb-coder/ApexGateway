import { test } from 'node:test';
import assert from 'node:assert';

const MARKETPLACE_URL = process.env.MARKETPLACE_URL || 'http://localhost:3000';
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';

test('ApexGateway E2E Functional Suite', async (t) => {
  const suffix = Date.now();
  const providerEmail = `provider_${suffix}@example.com`;
  const consumerEmail = `consumer_${suffix}@example.com`;
  const password = 'Password123!';
  
  let providerToken;
  let apiId;
  let planId;
  let consumerToken;
  let apiKey;
  const apiName = `weather-e2e-${suffix}`;

  // 1. Input Validation Tests
  await t.test('Input Validation - Authentication & API Creation', async () => {
    // Register with invalid email
    let res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad-email', password, role: 'PROVIDER' })
    });
    assert.strictEqual(res.status, 400);
    let body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
    assert.ok(body.details.some(d => d.field === 'email'));

    // Register with short password
    res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password: '123', role: 'PROVIDER' })
    });
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
    assert.ok(body.details.some(d => d.field === 'password'));

    // Register successfully
    res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password, role: 'PROVIDER' })
    });
    assert.strictEqual(res.status, 201);

    // Login successfully
    res = await fetch(`${MARKETPLACE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: providerEmail, password })
    });
    assert.strictEqual(res.status, 200);
    const loginData = await res.json();
    providerToken = loginData.token;

    // Create API with invalid URL
    res = await fetch(`${MARKETPLACE_URL}/apis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        name: apiName,
        upstreamUrl: 'not-a-url'
      })
    });
    assert.strictEqual(res.status, 400);
    body = await res.json();
    assert.strictEqual(body.code, 'VALIDATION_ERROR');
    assert.ok(body.details.some(d => d.field === 'upstreamUrl'));
  });

  // 2. Resource Publishing & Subscriptions
  await t.test('Publish API, Create Plan, Register Consumer, and Subscribe', async () => {
    // Create valid API
    let res = await fetch(`${MARKETPLACE_URL}/apis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        name: apiName,
        description: 'E2E Weather API',
        upstreamUrl: 'https://api.open-meteo.com'
      })
    });
    assert.strictEqual(res.status, 201);
    const apiData = await res.json();
    apiId = apiData.api.id;

    // Create Plan
    res = await fetch(`${MARKETPLACE_URL}/apis/${apiId}/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${providerToken}`
      },
      body: JSON.stringify({
        name: 'Standard Plan',
        requestsPerMin: 100,
        price: 9.99
      })
    });
    assert.strictEqual(res.status, 201);
    const planData = await res.json();
    planId = planData.plan.id;

    // Register consumer
    res = await fetch(`${MARKETPLACE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: consumerEmail, password, role: 'CONSUMER' })
    });
    assert.strictEqual(res.status, 201);

    // Login consumer
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

  // 3. Proxy Routing and Header Leakage Validation
  await t.test('Gateway Proxying - Successful response and header stripping', async () => {
    // Send request via gateway proxy to open-meteo (public API)
    const proxyUrl = `${GATEWAY_URL}/api/${apiName}/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true`;
    const res = await fetch(proxyUrl, {
      headers: {
        'X-API-Key': apiKey,
        'Authorization': `Bearer ${consumerToken}` // This should be stripped to avoid open-meteo rejecting it
      }
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.current_weather || data.current);
  });
});
