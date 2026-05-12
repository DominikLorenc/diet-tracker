import { Router } from 'express';
import {
    createDiaryEntry,
    getDiary,
    deleteDiaryEntry,
    deleteDiaryItem,
    toggleEatenItem,
} from '../controllers/diaryController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createDiaryEntry);
router.get('/', getDiary);
router.patch('/:id/eaten', toggleEatenItem);
router.delete('/:id', deleteDiaryEntry);
router.delete('/:id/item', deleteDiaryItem);

export default router;
