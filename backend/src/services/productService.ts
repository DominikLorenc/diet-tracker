import { Prisma, Product } from "../generated/prisma";
import { AppError } from "../utils/AppError";
import prisma from "../lib/prisma";


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
        throw new AppError("Product already exists", 409);
    }


    const newProduct = await prisma.product.create({
        data: product,
    });
    return newProduct;


};

export const getAllProducts = async (): Promise<Product[]> => {
    const products = await prisma.product.findMany();

    return products;
};

export const getProductById = async (id: string): Promise<Product> => {
    const product = await prisma.product.findUnique({
        where: {
            id: id,
        },
    });
    if (!product) {
        throw new AppError("Product not found", 404);
    }

    return product;
};


export const updateProductValues = async (id: string, product: Prisma.ProductUpdateInput): Promise<Product> => {

    const isProductExists = await productExists(id);
    if (isProductExists) {
        throw new AppError("Product not found", 404);
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

    const deletedProduct = await prisma.product.delete({
        where: {
            id: id,
        },
    });
    return deletedProduct;
};