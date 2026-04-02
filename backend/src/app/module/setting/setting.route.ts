import express from 'express';
import auth from '../../middleware/auth.js';
import { SettingControllers } from './setting.controller.js';
import { Role } from '../../../../generated/prisma/client/index.js';

const router = express.Router();

router.get('/story-duration', auth(Role.ADMIN, Role.MODERATOR), SettingControllers.getStoryDuration);
router.patch('/story-duration', auth(Role.ADMIN), SettingControllers.updateStoryDuration);

export const SettingRoutes = router;
