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
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.use(authMiddleware);

// The shared catalog is admin-curated: everyone may read it and log what they ate,
// but only admins may add, edit or remove entries that all users rely on.
router.post('/', requireAdmin, createProduct);
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/barcode/:code', getProductByBarcodeController);
router.get('/:id', getProduct);
router.patch('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
