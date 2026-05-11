import express from 'express';
import {
  getOverview,
  getInsights,
  getSavingsPrediction,
  postChat,
} from '../controllers/analyticsController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getOverview);
router.get('/insights', getInsights);
router.get('/savings-prediction', getSavingsPrediction);
router.post('/chat', postChat);

export default router;
