import { Request, Response, NextFunction } from 'express';
import {
    createProduct as createProductService,
    getAllProducts,
    getProductById,
    updateProductValues,
    deleteProductService,
    searchProductsService,
} from '../services/productService';
import { productSchema, productIdSchema, updateProductSchema, searchProductSchema } from '../schemas/productSchema';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = productSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ errors: result.error.issues });
            return;
        }

        const product = await createProductService(result.data);

        res.status(201).json({ message: 'Product created', product });
    } catch (error) {
        next(error);
    }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getAllProducts();
        res.status(200).json({ products });
    } catch (error) {
        next(error);
    }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
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
        next(error);
    }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    const result = searchProductSchema.safeParse({ search: req.query.q });
    if (!result.success) {
        res.status(400).json({ message: result.error.issues });
        return;
    }

    try {
        const query = result.data.search;
        const products = await searchProductsService(query);
        res.status(200).json({ products });
    } catch (error) {
        next(error);
    }
};
