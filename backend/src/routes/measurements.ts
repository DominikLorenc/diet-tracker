import { Router } from 'express';
import {
    createMeasurementController,
    getMeasurementsController,
    getMeasurementsByIdController,
    updateMeasurementController,
    deleteMeasurementController,
} from '../controllers/measurementsController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createMeasurementController);
router.get('/', getMeasurementsController);
router.get('/:id', getMeasurementsByIdController);
router.patch('/:id', updateMeasurementController);
router.delete('/:id', deleteMeasurementController);

export default router;
