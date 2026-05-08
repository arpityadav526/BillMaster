import express from 'express';
import { register, login, googleLogin, getMe } from '../controllers/authController.js';
import protect from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../validators/index.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);

export default router;
