import { Router } from 'express';
import {
    createUserRecipeController,
    getUserRecipesController,
    updateUserRecipeController,
    deleteUserRecipeController,
    copyRecipeController,
} from '../controllers/userRecipeController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createUserRecipeController);
router.get('/', getUserRecipesController);
router.patch('/:id', updateUserRecipeController);
router.delete('/:id', deleteUserRecipeController);
router.post('/copy', copyRecipeController);

export default router;
