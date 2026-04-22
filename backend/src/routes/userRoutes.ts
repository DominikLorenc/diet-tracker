import { Router } from 'express';
import { register, login, logout, me, updateGoals, updateImageUrlController } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);

router.use(authMiddleware);

router.get('/me', me);
router.patch('/image', updateImageUrlController);
router.patch('/goals', updateGoals);
router.delete('/logout', logout);

export default router;
