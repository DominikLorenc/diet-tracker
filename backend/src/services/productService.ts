import { Prisma, Product } from '../generated/prisma';
import { AppError } from '../utils/AppError';
import prisma from '../lib/prisma';

export const productExists = async (name: string): Promise<boolean> => {
    const product = await prisma.product.findUnique({
        where: {
            name: name,
        },
    });
    return !!product;
};

export const createProduct = async (product: Prisma.ProductCreateInput): Promise<Product> => {
    const exists = await productExists(product.name);
    if (exists) {
        throw new AppError('Product already exists', 409);
    }

    const newProduct = await prisma.product.create({
        data: product,
    });
    return newProduct;
};

export const getAllProducts = async ({
    page,
    limit,
    search,
}: {
    page: number;
    limit: number;
    search?: string;
}): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
    const where: Prisma.ProductWhereInput | undefined = search
        ? { name: { contains: search, mode: 'insensitive' } }
        : undefined;

    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit }),
        prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
};

export const getProductById = async (id: string): Promise<Product> => {
    const product = await prisma.product.findUnique({
        where: {
            id: id,
        },
    });
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    return product;
};

export const updateProductValues = async (id: string, product: Prisma.ProductUpdateInput): Promise<Product> => {
    const productToUpdate = await getProductById(id);

    const name = product?.name;

    if (typeof name === 'string' && name !== productToUpdate.name) {
        const exists = await productExists(name);
        if (exists) {
            throw new AppError('Product already exists', 409);
        }
    }

    const updatedProduct = await prisma.product.update({
        where: {
            id: id,
        },
        data: product,
    });

    return updatedProduct;
};

export const deleteProductService = async (id: string): Promise<Product> => {
    await getProductById(id);

    const [existingInDiary, existingInRecipe] = await Promise.all([
        prisma.diaryEntryItem.findFirst({ where: { productId: id } }),
        prisma.recipeIngredient.findFirst({ where: { productId: id } }),
    ]);

    if (existingInDiary || existingInRecipe) {
        throw new AppError('Product is used in diary or recipe', 409);
    }

    const deletedProduct = await prisma.product.delete({
        where: {
            id: id,
        },
    });
    return deletedProduct;
};

export const searchProductsService = async (search: string): Promise<Product[]> => {
    const products = await prisma.product.findMany({
        where: {
            name: {
                contains: search,
                mode: 'insensitive',
            },
        },
        orderBy: {
            name: 'asc',
        },
        take: 10,
    });

    return products;
};

export type BarcodeProductResult = {
    id?: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    barcode: string;
    imageUrl: string;
    source: 'database' | 'open_food_facts';
};

type OpenFoodFactsResponse = {
    status: number;
    product?: {
        product_name?: string;
        image_front_url?: string;
        nutriments?: {
            'energy-kcal_100g'?: number;
            proteins_100g?: number;
            carbohydrates_100g?: number;
            fat_100g?: number;
        };
    };
};

export const getProductByBarcode = async (code: string, isAdmin: boolean): Promise<BarcodeProductResult> => {
    const product = await prisma.product.findUnique({
        where: { barcode: code },
    });

    if (product) {
        return {
            id: product.id,
            name: product.name,
            calories: Number(product.calories),
            protein: Number(product.protein),
            carbs: Number(product.carbs),
            fat: Number(product.fat),
            barcode: code,
            imageUrl: product.imageUrl,
            source: 'database',
        };
    }

    if (!isAdmin) {
        throw new AppError('Product not found', 404);
    }

    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);

    if (!response.ok) {
        throw new AppError('Product not found', 404);
    }

    const json: OpenFoodFactsResponse = await response.json();

    if (json.status !== 1 || !json.product) {
        throw new AppError('Product not found', 404);
    }

    const off = json.product;

    return {
        name: off.product_name ?? '',
        calories: off.nutriments?.['energy-kcal_100g'] ?? 0,
        protein: off.nutriments?.['proteins_100g'] ?? 0,
        carbs: off.nutriments?.['carbohydrates_100g'] ?? 0,
        fat: off.nutriments?.['fat_100g'] ?? 0,
        barcode: code,
        imageUrl: off.image_front_url ?? '',
        source: 'open_food_facts',
    };
};
