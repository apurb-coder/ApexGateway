import express from 'express';
import { createApi, getApis, getApiById, createPlan } from '../controllers/apiController.js';
import { authMiddleware, optionalAuth, authorize } from '../middlewares/authMiddleware.js';
import { validateSchema, apiSchema, planSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(apiSchema), createApi);
router.get('/', optionalAuth, getApis);
router.get('/:id', optionalAuth, getApiById);
router.post('/:apiId/plans', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(planSchema), createPlan);

export default router;
