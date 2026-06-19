import crypto from 'crypto';
import prisma from '../utils/prisma.js';
import redis from '../utils/redis.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export const subscribe = async (req, res) => {
  try {
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'planId is required' });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { api: true }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Generate unique API Key: apx_live_ + 32 secure random hex bytes (64 chars)
    const rawApiKey = `apx_live_${crypto.randomBytes(32).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    // Check if paid plan
    const isPaidPlan = Number(plan.price) > 0;

    const subscription = await prisma.subscription.create({
      data: {
        consumerId: req.user.id,
        planId: plan.id,
        apiKeyHash,
        isActive: !isPaidPlan, // True if free, false if paid
      }
    });

    if (!isPaidPlan) {
      return res.status(201).json({
        message: 'Subscribed to free tier successfully',
        subscriptionId: subscription.id,
        apiKey: rawApiKey,
        isActive: true
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan.api.name} - ${plan.name} Plan`,
            description: `Subscription to ${plan.api.name} API`,
          },
          unit_amount: Math.round(Number(plan.price) * 100), // convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/dashboard/consumer/keys?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${process.env.CLIENT_URL}/apis/${plan.apiId}?status=cancelled`,
      metadata: {
        subscriptionId: subscription.id,
        consumerId: req.user.id
      }
    });

    // Attach session ID to subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { 
        stripeSessionId: session.id,
        stripeCheckoutUrl: session.url
      }
    });

    return res.status(201).json({
      message: 'Checkout session created',
      subscriptionId: subscription.id,
      apiKey: rawApiKey,
      stripeCheckoutUrl: session.url,
      isActive: false
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    let subscriptions;

    if (req.user.role === 'PROVIDER') {
      // Providers see subscriptions to their own APIs
      subscriptions = await prisma.subscription.findMany({
        where: {
          plan: {
            api: {
              providerId: req.user.id
            }
          }
        },
        include: {
          plan: {
            include: { api: true }
          },
          consumer: {
            select: { id: true, email: true }
          }
        }
      });
    } else {
      // Consumers see their own subscriptions
      subscriptions = await prisma.subscription.findMany({
        where: { consumerId: req.user.id },
        include: {
          plan: {
            include: { api: true }
          }
        }
      });
    }

    // Never return the hashed key in list response
    const sanitized = subscriptions.map(sub => {
      const { apiKeyHash: _apiKeyHash, ...rest } = sub;
      return rest;
    });

    return res.json({ subscriptions: sanitized });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.consumerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to cancel this subscription' });
    }

    // Invalidate API key in Redis cache
    if (subscription.apiKeyHash) {
      const cacheKey = `auth:key:${subscription.apiKeyHash}`;
      try {
        await redis.del(cacheKey);
      } catch (redisError) {
        console.error('Failed to invalidate Redis API key cache:', redisError);
      }
    }

    await prisma.subscription.delete({
      where: { id }
    });

    return res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const regenerateApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    if (subscription.consumerId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to regenerate this key' });
    }

    // Invalidate old key in Redis cache
    if (subscription.apiKeyHash) {
      const cacheKey = `auth:key:${subscription.apiKeyHash}`;
      try {
        await redis.del(cacheKey);
      } catch (redisError) {
        console.error('Failed to invalidate Redis API key cache:', redisError);
      }
    }

    // Generate unique API Key: apx_live_ + 32 secure random hex bytes (64 chars)
    const rawApiKey = `apx_live_${crypto.randomBytes(32).toString('hex')}`;
    const apiKeyHash = crypto.createHash('sha256').update(rawApiKey).digest('hex');

    await prisma.subscription.update({
      where: { id },
      data: { apiKeyHash }
    });

    return res.json({
      message: 'API key regenerated successfully',
      apiKey: rawApiKey
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


