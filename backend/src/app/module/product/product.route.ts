import express from 'express';
import auth from '../../middleware/auth.js';
import { ProductControllers } from './product.controller.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), ProductControllers.createProduct);
router.get('/', ProductControllers.getAllProducts);
router.get('/:id', ProductControllers.getProductById);
router.put('/:id', auth('USER', 'ADMIN', 'MODERATOR'), ProductControllers.updateProduct);
router.delete('/:id', auth('USER', 'ADMIN', 'MODERATOR'), ProductControllers.deleteProduct);

export const ProductRoutes = router;
