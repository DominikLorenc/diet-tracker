import { RecentSearch } from '../generated/prisma';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { getProductById } from './productService';

const productIdExistsInRecentSearches = async (productId: string, userId: string) => {
    const recentSearches = await prisma.recentSearch.findFirst({
        where: {
            productId: productId,
            userId: userId,
        },
    });

    if (!recentSearches) {
        return false;
    }

    return recentSearches.id;
};

const maxSearches = 10;

export const addRecentSearchService = async (productId: string, userId: string): Promise<RecentSearch> => {
    const existsId = await productIdExistsInRecentSearches(productId, userId);
    if (existsId) {
        const updated = await prisma.recentSearch.update({
            where: {
                id: existsId,
            },
            data: {
                createdAt: new Date(),
            },
        });
        return updated;
    }

    await getProductById(productId);

    const recentSearchLength = await prisma.recentSearch.count({
        where: {
            userId: userId,
        },
    });

    if (recentSearchLength >= maxSearches) {
        const oldestSearch = await prisma.recentSearch.findFirst({
            where: {
                userId: userId,
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
        if (!oldestSearch) {
            throw new AppError('No recent searches found', 404);
        }

        await prisma.recentSearch.delete({
            where: {
                id: oldestSearch?.id,
            },
        });
    }

    const newRecentSearch = await prisma.recentSearch.create({
        data: {
            userId: userId,
            productId: productId,
        },
    });

    return newRecentSearch;
};

export const getRecentSearchesService = async (userId: string): Promise<RecentSearch[]> => {
    const recentSearches = await prisma.recentSearch.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 10,
    });

    return recentSearches;
};
