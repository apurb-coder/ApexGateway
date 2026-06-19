import express from 'express';
import { stripeWebhook, getEarnings, requestWithdrawal } from '../controllers/paymentController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Provider Financial Operations
router.get('/earnings', authMiddleware, authorize(['PROVIDER', 'ADMIN']), getEarnings);
router.post('/withdraw', authMiddleware, authorize(['PROVIDER', 'ADMIN']), requestWithdrawal);

export default router;
