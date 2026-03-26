import { Router } from 'express';
import auth from '../../middleware/auth.js';
import { GroupController } from './group.controller.js';

const router = Router();

router.post('/', auth(), GroupController.createGroup);
router.get('/', auth(), GroupController.getUserGroups);

export const GroupRoutes = router;
