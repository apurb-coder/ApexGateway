import express from 'express';
import { subscribe, getSubscriptions, cancelSubscription } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema, subscriptionSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, validateSchema(subscriptionSchema), subscribe);
router.get('/', authMiddleware, getSubscriptions);
router.delete('/:id', authMiddleware, cancelSubscription);

export default router;
