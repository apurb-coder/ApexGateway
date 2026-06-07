import crypto from 'crypto';
import prisma from '../utils/prisma.js';

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

    const subscription = await prisma.subscription.create({
      data: {
        consumerId: req.user.id,
        planId: plan.id,
        apiKeyHash
      }
    });

    // Return the raw key to the consumer ONLY ONCE
    return res.status(201).json({
      message: 'Subscribed successfully',
      subscriptionId: subscription.id,
      apiKey: rawApiKey,
      instructions: 'Save this API key. It will not be shown again.'
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
      const { apiKeyHash, ...rest } = sub;
      return rest;
    });

    return res.json({ subscriptions: sanitized });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
