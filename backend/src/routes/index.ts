import { Router } from 'express';
import userRoutes from './userRoutes';
import mealRoutes from './mealRoutes';
import productRoutes from './productRoutes';
import diaryRouter from './diaryRouter';

const router = Router();

router.use('/users', userRoutes);
router.use('/meals', mealRoutes);
router.use('/products', productRoutes);
router.use('/diary', diaryRouter);

export default router;
