import { Router } from 'express';
import { createRecipe, getRecipes, getRecipe, updateRecipe, deleteRecipe } from '../controllers/recipeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createRecipe);
router.get('/', getRecipes);
router.get('/:id', getRecipe);
router.patch('/:id', updateRecipe);
router.delete('/:id', deleteRecipe);

export default router;
