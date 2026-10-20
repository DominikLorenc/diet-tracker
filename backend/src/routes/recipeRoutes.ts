import { Router } from 'express';
import {
    createRecipe,
    getRecipes,
    getRecipeCategories,
    getRecipe,
    updateRecipe,
    deleteRecipe,
} from '../controllers/recipeController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.use(authMiddleware);

router.post('/', requireAdmin, createRecipe);
router.get('/', getRecipes);
// Must be registered before '/:id', otherwise "categories" is treated as a recipe id
router.get('/categories', getRecipeCategories);
router.get('/:id', getRecipe);
router.patch('/:id', requireAdmin, updateRecipe);
router.delete('/:id', requireAdmin, deleteRecipe);

export default router;
