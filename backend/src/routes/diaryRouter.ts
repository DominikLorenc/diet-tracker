import { Router } from 'express';
import { createDiaryEntry, getDiary, deleteDiaryEntry, deleteDiaryItem } from '../controllers/diaryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createDiaryEntry);
router.get('/', getDiary);
router.delete('/:id', deleteDiaryEntry);
router.delete('/:id/item', deleteDiaryItem);

export default router;
