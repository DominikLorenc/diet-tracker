import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProductByBarcodeController,
} from '../controllers/productController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/', createProduct);
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/barcode/:code', getProductByBarcodeController);
router.get('/:id', getProduct);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;
