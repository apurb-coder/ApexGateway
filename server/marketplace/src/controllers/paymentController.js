import Stripe from 'stripe';
import prisma from '../utils/prisma.js';
import redis from '../utils/redis.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key');

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'dummy_secret';
    // Use req.body (which should be the raw buffer/string if mounted correctly)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    // Find the subscription associated with this session
    const subscription = await prisma.subscription.findUnique({
      where: { stripeSessionId: session.id },
      include: { plan: { include: { api: true } } }
    });

    if (subscription) {
      // Idempotency check: see if transaction already exists for this payment intent/checkout session
      const stripePaymentId = session.payment_intent || `stripe_tx_${session.id}`;
      const existingTx = await prisma.transaction.findUnique({
        where: { stripePaymentId }
      });

      if (!existingTx) {
        // 1. Activate Subscription
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { isActive: true }
        });

        // 2. Record Transaction Ledger for Provider (100% payout)
        await prisma.transaction.create({
          data: {
            subscriptionId: subscription.id,
            providerId: subscription.plan.api.providerId,
            amount: subscription.plan.price,
            stripePaymentId
          }
        });

        // 3. Invalidate Redis Auth cache
        const cacheKey = `auth:key:${subscription.apiKeyHash}`;
        try {
          await redis.del(cacheKey);
        } catch (redisError) {
          console.error('Failed to invalidate Redis cache in webhook:', redisError);
        }
      }
    }
  }

  res.json({ received: true });
};

// GET /api/provider/earnings
export const getEarnings = async (req, res) => {
  try {
    const providerId = req.user.id;

    // 1. Get gross accumulated earnings
    const aggregations = await prisma.transaction.aggregate({
      where: { providerId },
      _sum: { amount: true }
    });
    const grossEarnings = aggregations._sum.amount || 0;

    // 2. Get total completed/approved withdrawals
    const withdrawalsAgg = await prisma.withdrawalRequest.aggregate({
      where: { 
        providerId,
        status: { in: ['COMPLETED', 'APPROVED'] }
      },
      _sum: { amount: true }
    });
    const totalWithdrawn = withdrawalsAgg._sum.amount || 0;

    // Available Balance = Gross Earnings - Total Withdrawn
    const balance = Number(grossEarnings) - Number(totalWithdrawn);

    // 3. Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: { providerId },
      include: {
        subscription: {
          include: {
            consumer: { select: { email: true } },
            plan: { include: { api: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 4. Get recent withdrawals
    const withdrawals = await prisma.withdrawalRequest.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      grossEarnings: Number(grossEarnings),
      totalWithdrawn: Number(totalWithdrawn),
      balance,
      transactions,
      withdrawals
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/provider/withdraw
export const requestWithdrawal = async (req, res) => {
  try {
    const providerId = req.user.id;
    const { amount, payoutMethod, payoutDetails } = req.body;

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Withdrawal amount must be greater than zero.' });
    }

    // Calculate current available balance
    const aggregations = await prisma.transaction.aggregate({
      where: { providerId },
      _sum: { amount: true }
    });
    const grossEarnings = aggregations._sum.amount || 0;

    // Deduct pending, completed, or approved withdrawals
    const withdrawalsAgg = await prisma.withdrawalRequest.aggregate({
      where: { 
        providerId,
        status: { in: ['COMPLETED', 'APPROVED', 'PENDING'] }
      },
      _sum: { amount: true }
    });
    const totalDeducted = withdrawalsAgg._sum.amount || 0;

    const availableBalance = Number(grossEarnings) - Number(totalDeducted);

    if (parsedAmount > availableBalance) {
      return res.status(400).json({ error: `Insufficient balance. Available to withdraw: $${availableBalance}` });
    }

    const withdrawal = await prisma.withdrawalRequest.create({
      data: {
        providerId,
        amount: parsedAmount,
        payoutMethod,
        payoutDetails: payoutDetails || {}, // JSON structure depending on method
        status: 'PENDING'
      }
    });

    return res.status(201).json({
      message: 'Withdrawal request submitted successfully.',
      withdrawal
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
