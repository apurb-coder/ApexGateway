import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateSchema, registerSchema, loginSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);

export default router;
