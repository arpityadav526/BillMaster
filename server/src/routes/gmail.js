/**
 * Gmail API Routes
 *
 * All routes except /callback are protected by JWT auth middleware.
 * The /callback route is unprotected because it's called by Google's OAuth redirect.
 */
import express from 'express';
import {
  getAuthUrl,
  handleCallback,
  getStatus,
  triggerSync,
  disconnect,
} from '../controllers/gmailController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

// OAuth callback — must be UNPROTECTED (Google redirects here directly)
router.get('/callback', handleCallback);

// All other routes require authentication
router.use(protect);

router.get('/auth', getAuthUrl);
router.get('/status', getStatus);
router.post('/sync', triggerSync);
router.post('/disconnect', disconnect);

export default router;
