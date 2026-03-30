import express from 'express';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';
import { AdminControllers } from './admin.controller.js';

const router = express.Router();

router.get('/stats', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getDashboardStats);
router.get('/users', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllUsers);
router.patch('/users/:id/role', auth(Role.ADMIN), AdminControllers.updateUserRole);
router.delete('/users/:id', auth(Role.ADMIN), AdminControllers.deleteUser);
router.get('/posts', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllPosts);
router.get('/stories', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllStories);
router.delete('/stories/:id', auth(Role.ADMIN), AdminControllers.deleteStory);
router.get('/products', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllProducts);
router.get('/properties', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllProperties);

export const AdminRoutes = router;
