import express from 'express';
import { register, getMe, login } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { validateSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

const syncSchema = {
  role: { required: true, type: 'string', enum: ['PROVIDER', 'CONSUMER'] }
};

router.post('/register', authMiddleware, validateSchema(syncSchema), register);
router.get('/me', authMiddleware, getMe);
router.post('/login', login);

export default router;
