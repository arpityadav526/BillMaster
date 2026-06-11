import express from 'express';
import {
  getOverview,
  getDashboard,
  getInsights,
  getSavingsPrediction,
  postChat,
} from '../controllers/analyticsController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/dashboard', getDashboard);
router.get('/insights', getInsights);
router.get('/savings-prediction', getSavingsPrediction);
router.post('/chat', postChat);

export default router;
