import { Router } from 'express';
import { addRecentSearch, getRecentSearches } from '../controllers/recentSearchesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', addRecentSearch);
router.get('/', getRecentSearches);

export default router;
