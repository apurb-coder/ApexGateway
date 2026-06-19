import express from 'express';
import { subscribe, getSubscriptions, cancelSubscription, regenerateApiKey } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema, subscriptionSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, validateSchema(subscriptionSchema), subscribe);
router.get('/', authMiddleware, getSubscriptions);
router.post('/:id/regenerate', authMiddleware, regenerateApiKey);
router.delete('/:id', authMiddleware, cancelSubscription);

export default router;

