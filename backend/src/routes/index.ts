import { Router } from 'express';
import userRoutes from './userRoutes';
import productRoutes from './productRoutes';
import diaryRouter from './diaryRouter';
import recipeRoutes from './recipeRoutes';
import recentSearchesRoute from './recentSearchesRoute';

const router = Router();

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/diary', diaryRouter);
router.use('/recipes', recipeRoutes);
router.use('/recent-searches', recentSearchesRoute);

export default router;
