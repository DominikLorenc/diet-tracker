import { Request, Response } from 'express';
import {
    createProduct as createProductService,
    getAllProducts,
    getProductById,
    updateProductValues,
    deleteProductService,
} from '../services/productService';
import { productSchema, productIdSchema, updateProductSchema } from '../schemas/productSchema';
import { AppError } from '../utils/AppError';

export const createProduct = async (req: Request, res: Response) => {
    try {
        const result = productSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.issues });
            return;
        }

        const product = await createProductService(result.data);

        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Could not create product' });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const products = await getAllProducts();
        res.status(200).json({ products });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Could not get products' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = productIdSchema.safeParse(id);
    if (!result.success) {
        res.status(400).json({ message: 'Invalid product ID' });
        return;
    }

    try {
        const product = await getProductById(result.data);
        res.status(200).json({ product });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Could not get product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const result = productIdSchema.safeParse(id);
        if (!result.success) {
            res.status(400).json({ message: result.error.issues });
            return;
        }

        const validationProduct = updateProductSchema.safeParse(req.body);

        if (!validationProduct.success) {
            res.status(400).json({ message: validationProduct.error.issues });
            return;
        }

        const updated = await updateProductValues(result.data, validationProduct.data);

        res.status(200).json({ product: updated });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Could not update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = productIdSchema.safeParse(id);
    if (!result.success) {
        res.status(404).json({ message: result.error.issues });
        return;
    }

    try {
        const deleted = await deleteProductService(result.data);
        res.status(200).json({ message: 'Product deleted', deleted });
    } catch (error) {
        if (error instanceof AppError) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Could not delete product' });
    }
};
