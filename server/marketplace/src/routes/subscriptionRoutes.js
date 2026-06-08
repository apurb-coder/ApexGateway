import express from 'express';
import { subscribe, getSubscriptions } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema, subscriptionSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, validateSchema(subscriptionSchema), subscribe);
router.get('/', authMiddleware, getSubscriptions);

export default router;
