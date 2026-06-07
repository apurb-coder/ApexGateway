import express from 'express';
import { createApi, getApis, getApiById, createPlan } from '../controllers/apiController.js';
import { authMiddleware, authorize } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.post('/', authMiddleware, authorize(['PROVIDER', 'ADMIN']), createApi);
router.get('/', getApis);
router.get('/:id', getApiById);
router.post('/:apiId/plans', authMiddleware, authorize(['PROVIDER', 'ADMIN']), createPlan);

export default router;
