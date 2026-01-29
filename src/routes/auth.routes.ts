import { Router } from 'express';
import * as AuthController from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/google', authLimiter, AuthController.googleLogin);
router.post('/refresh', authLimiter, AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateToken, AuthController.me);
router.delete('/me', authenticateToken, AuthController.deleteAccount);

export default router;
