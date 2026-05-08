import express from 'express';
import { getNotifications, markRead, markAllRead, removeNotification, triggerTestNotification } from '../controllers/notificationController.js';
import protect from '../middleware/auth.js';

const router = express.Router();
router.use(protect);

router.get('/', getNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);
router.post('/trigger-test', triggerTestNotification);
router.delete('/:id', removeNotification);

export default router;
