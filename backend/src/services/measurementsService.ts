import { BodyMeasurement, Prisma } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const createNewMeasurement = async (
    userId: string,
    weight: number,
    waist: number,
    hips: number,
    arm: number,
    date?: Date,
): Promise<BodyMeasurement> => {
    const newMeasurement = await prisma.bodyMeasurement.create({
        data: {
            userId,
            weight,
            waist,
            hips,
            arm,
            date: date ?? new Date(),
        },
    });
    return newMeasurement;
};

export const getMeasurementsByUserId = async (userId: string): Promise<BodyMeasurement[]> => {
    const measurements = await prisma.bodyMeasurement.findMany({
        where: {
            userId,
        },
    });
    return measurements;
};

export const getMeasurementById = async (id: string, userId: string): Promise<BodyMeasurement> => {
    const measurement = await prisma.bodyMeasurement.findFirst({
        where: {
            id,
            userId,
        },
    });
    if (!measurement) {
        throw new AppError('Measurement not found', 404);
    }
    return measurement;
};

export const updateMeasurement = async (
    id: string,
    userId: string,
    data: {
        weight?: number;
        waist?: number;
        hips?: number;
        arm?: number;
    },
): Promise<BodyMeasurement> => {
    try {
        return await prisma.bodyMeasurement.update({
            where: { id, userId },
            data,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError('Measurement not found', 404);
            }
        }
        throw error;
    }
};

export const deleteMeasurement = async (id: string, userId: string): Promise<BodyMeasurement> => {
    try {
        return await prisma.bodyMeasurement.delete({
            where: { id, userId },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2025') {
                throw new AppError('Measurement not found', 404);
            }
        }
        throw error;
    }
};
