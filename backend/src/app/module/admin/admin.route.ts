import express from 'express';
import auth from '../../middleware/auth.js';
import { Role } from '../../../../generated/prisma/client/index.js';
import { AdminControllers } from './admin.controller.js';

const router = express.Router();

router.get('/stats', auth(Role.ADMIN, Role.MODERATOR), AdminControllers.getDashboardStats);

export const AdminRoutes = router;
