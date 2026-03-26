import { Router } from 'express';
import { ReactionControllers } from './reaction.controller.js';
import auth from '../../middleware/auth.js';

const router = Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), ReactionControllers.toggleReaction);

export const ReactionRoutes = router;
