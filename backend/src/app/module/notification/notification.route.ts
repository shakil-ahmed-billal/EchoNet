import express from 'express';
import { NotificationControllers } from './notification.controller.js';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.use(auth(Role.USER, Role.ADMIN, Role.MODERATOR));

router.get('/', NotificationControllers.getUserNotifications);
router.get('/unread-count', NotificationControllers.getUnreadCount);
router.patch('/:id/read', NotificationControllers.markAsRead);

export const NotificationRoutes = router;
