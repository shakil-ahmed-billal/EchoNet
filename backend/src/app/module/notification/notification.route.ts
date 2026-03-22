import express from 'express';
import { NotificationControllers } from './notification.controller.js';

const router = express.Router();

router.get('/', NotificationControllers.getUserNotifications);
router.get('/unread-count', NotificationControllers.getUnreadCount);
router.patch('/:id/read', NotificationControllers.markAsRead);

export const NotificationRoutes = router;
