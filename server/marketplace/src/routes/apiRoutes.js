import express from 'express';
import { createApi, getApis, getApiById, createPlan } from '../controllers/apiController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';
import { validateSchema, apiSchema, planSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(apiSchema), createApi);
router.get('/', getApis);
router.get('/:id', getApiById);
router.post('/:apiId/plans', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(planSchema), createPlan);

export default router;
