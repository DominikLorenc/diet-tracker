import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
    getFavoriteProducts,
    addFavoriteProduct,
    removeFavoriteProduct,
    getFavoriteRecipes,
    addFavoriteRecipe,
    removeFavoriteRecipe,
} from '../controllers/favoritesController';

const router = Router();

router.use(authMiddleware);

router.get('/products', getFavoriteProducts);
router.post('/products', addFavoriteProduct);
router.delete('/products/:productId', removeFavoriteProduct);
router.get('/recipes', getFavoriteRecipes);
router.post('/recipes', addFavoriteRecipe);
router.delete('/recipes/:recipeId', removeFavoriteRecipe);

export default router;
