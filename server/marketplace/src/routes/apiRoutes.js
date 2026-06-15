import express from 'express';
import { createApi, getApis, getApiById, createPlan, updatePlan, deletePlan, getAnalyticsSummary, getApiHealth } from '../controllers/apiController.js';
import { authMiddleware, optionalAuth, authorize } from '../middlewares/authMiddleware.js';
import { validateSchema, apiSchema, planSchema } from '../middlewares/validationMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(apiSchema), createApi);
router.get('/', optionalAuth, getApis);
router.get('/analytics/summary', authMiddleware, authorize(['PROVIDER', 'ADMIN']), getAnalyticsSummary);
router.get('/:id/health', authMiddleware, authorize(['PROVIDER', 'ADMIN']), getApiHealth);
router.get('/:id', optionalAuth, getApiById);
router.post('/:apiId/plans', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(planSchema), createPlan);
router.put('/:apiId/plans/:planId', authMiddleware, authorize(['PROVIDER', 'ADMIN']), validateSchema(planSchema), updatePlan);
router.delete('/:apiId/plans/:planId', authMiddleware, authorize(['PROVIDER', 'ADMIN']), deletePlan);

export default router;
