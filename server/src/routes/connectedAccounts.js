import express from 'express';
import {
  getAccounts,
  connectAccount,
  disconnectAccount,
  importTransactions,
} from '../controllers/connectedAccountController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAccounts);

router.post('/connect', connectAccount);
router.delete('/:id', disconnectAccount);
router.post('/:id/import', importTransactions);

export default router;
