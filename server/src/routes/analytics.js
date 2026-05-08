import express from 'express';
import {
  getOverview,
  getInsights
} from '../controllers/analyticsController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/insights', getInsights);

export default router;
