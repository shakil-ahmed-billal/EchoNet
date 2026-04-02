import express from 'express';
import auth from '../../middleware/auth.js';
import { ProductReviewControllers } from './product.review.controller.js';

const router = express.Router();

router.post('/:id/reviews', auth('USER', 'ADMIN', 'MODERATOR'), ProductReviewControllers.createReview);
router.post('/reviews/:id/like', auth('USER', 'ADMIN', 'MODERATOR'), ProductReviewControllers.likeReview);
router.post('/reviews/:id/reply', auth('USER', 'ADMIN', 'MODERATOR'), ProductReviewControllers.createReply);

export const ProductReviewRoutes = router;
