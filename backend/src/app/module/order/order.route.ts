import express from 'express';
import auth from '../../middleware/auth.js';
import { OrderControllers } from './order.controller.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), OrderControllers.createOrder);
router.get('/my-orders', auth('USER', 'ADMIN', 'MODERATOR'), OrderControllers.getMyOrders);
router.get('/store-orders', auth('USER', 'ADMIN', 'MODERATOR'), OrderControllers.getStoreOrders);
router.get('/:id', auth('USER', 'ADMIN', 'MODERATOR'), OrderControllers.getOrderById);
router.patch('/:id/status', auth('USER', 'ADMIN', 'MODERATOR'), OrderControllers.updateOrderStatus);

export const OrderRoutes = router;
