import { Router } from 'express';
import userRoutes from './userRoutes';
import mealRoutes from './mealRoutes';
import productRoutes from './productRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/meals', mealRoutes);
router.use('/products', productRoutes);

export default router;
