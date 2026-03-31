import express from 'express';
import auth from '../../middleware/auth.js';
import { ProductControllers } from './product.controller.js';
import { redisCache } from '../../utils/redisCache.js';

import { ProductReviewRoutes } from './product.review.route.js';

import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), upload.array('images', 10), ProductControllers.createProduct);
router.get('/', redisCache('products', 60), ProductControllers.getAllProducts);
router.get('/:id', redisCache('products', 60), ProductControllers.getProductById);
router.put('/:id', auth('USER', 'ADMIN', 'MODERATOR'), upload.array('images', 10), ProductControllers.updateProduct);
router.delete('/:id', auth('USER', 'ADMIN', 'MODERATOR'), ProductControllers.deleteProduct);

// Review Routes
router.use('/', ProductReviewRoutes);

export const ProductRoutes = router;
