import express from 'express';
import { UserControllers } from './user.controller.js';

const router = express.Router();

router.get('/', UserControllers.getAllUsers);
router.get('/:id', UserControllers.getUserById);
router.patch('/:id', UserControllers.updateUser);
router.patch('/:id/suspend', UserControllers.suspendUser);

export const UserRoutes = router;
