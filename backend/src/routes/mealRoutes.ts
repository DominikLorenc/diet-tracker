import { Router } from 'express';
import { createMeal, getMeals, getMeal, updateMeal, deleteMeal } from '../controllers/mealController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createMeal);
router.get('/', getMeals);
router.get('/:id', getMeal);
router.patch('/:id', updateMeal);
router.delete('/:id', deleteMeal);

export default router;
