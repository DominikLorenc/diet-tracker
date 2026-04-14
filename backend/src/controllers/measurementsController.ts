import { Request, Response, NextFunction } from 'express';
import {
    getMeasurementsByUserId,
    createNewMeasurement,
    updateMeasurement,
    deleteMeasurement,
    getMeasurementById,
} from '../services/measurementsService';
import { measurementsSchema, measurementsIdSchema } from '../schemas/measurements';

export const createMeasurementController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = measurementsSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const { weight, waist, hips, arm } = result.data;

        const measurement = await createNewMeasurement(userId, weight, waist, hips, arm);

        res.status(201).json({ message: 'Measurement created', measurement });
    } catch (error) {
        next(error);
    }
};

export const getMeasurementsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const measurements = await getMeasurementsByUserId(userId);

        res.status(200).json({ message: 'Measurements', measurements });
    } catch (error) {
        next(error);
    }
};

export const getMeasurementsByIdController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const result = measurementsIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const measurement = await getMeasurementById(result.data, userId);

        res.status(200).json({ message: 'Measurement', measurement });
    } catch (error) {
        next(error);
    }
};

export const updateMeasurementController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const paramsResult = measurementsIdSchema.safeParse(req.params.id);
        if (!paramsResult.success) {
            res.status(400).json({ message: paramsResult.error.issues });
            return;
        }

        const bodyResult = measurementsSchema.partial().safeParse(req.body);
        if (!bodyResult.success) {
            res.status(400).json({ message: bodyResult.error.issues });
            return;
        }
        if (Object.keys(bodyResult.data).length === 0) {
            res.status(400).json({ message: 'At least one field is required to update measurement' });
            return;
        }

        const measurement = await updateMeasurement(paramsResult.data, userId, bodyResult.data);

        res.status(200).json({ message: 'Measurement updated', measurement });
    } catch (error) {
        next(error);
    }
};

export const deleteMeasurementController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { id } = req.params;

        const result = measurementsIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const deleted = await deleteMeasurement(result.data, userId);

        res.status(200).json({ message: 'Measurement deleted', deleted });
    } catch (error) {
        next(error);
    }
};
