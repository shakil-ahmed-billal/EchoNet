import express from 'express';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';
import { AdminControllers } from './admin.controller.js';

const router = express.Router();

router.get('/stats', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getDashboardStats);
router.get('/users', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllUsers);
router.patch('/users/:id/role', auth(Role.ADMIN), AdminControllers.updateUserRole);
router.delete('/users/:id', auth(Role.ADMIN), AdminControllers.deleteUser);

// Moderation Routes
router.get('/posts', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllPosts);
router.patch('/posts/:id/status', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.updatePostStatus);
router.delete('/posts/:id', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.deletePost);

router.get('/stories', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllStories);
router.delete('/stories/:id', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.deleteStory);

router.get('/products', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllProducts);
router.patch('/products/:id/status', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.updateProductStatus);
router.delete('/products/:id', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.deleteProduct);

router.get('/properties', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getAllProperties);
router.patch('/properties/:id/status', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.updatePropertyStatus);
router.delete('/properties/:id', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.deleteProperty);

// Agent Verification (Shared with Admin/Moderator)
router.patch('/agents/:id/verify', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.verifyAgent);
router.delete('/agents/:id', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.rejectAgent);

export const AdminRoutes = router;
