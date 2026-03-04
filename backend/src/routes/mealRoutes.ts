import { Router } from 'express';
import {
    createMeal,
    getMeals,
    getMeal,
    updateMeal,
    deleteMeal,
    addProductToMeal,
    removeProductFromMeal,
} from '../controllers/mealController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createMeal);
router.get('/', getMeals);
router.get('/:id', getMeal);
router.post('/:id/products', addProductToMeal);
router.patch('/:id', updateMeal);
router.delete('/:id', deleteMeal);
router.delete('/:mealId/products/:mealProductId', removeProductFromMeal);

export default router;
