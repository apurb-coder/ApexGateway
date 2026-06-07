import express from 'express';
import { subscribe, getSubscriptions } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', authMiddleware, subscribe);
router.get('/', authMiddleware, getSubscriptions);

export default router;
