import express from 'express';
import auth from '../../middleware/auth.js';
import { AgentControllers } from './agent.controller.js';

const router = express.Router();

router.get('/profile', auth('USER', 'ADMIN', 'MODERATOR'), AgentControllers.getAgentProfile);
router.get('/', AgentControllers.getAllAgents);
router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), AgentControllers.createAgentProfile);
router.put('/:id/verify', auth('ADMIN', 'MODERATOR'), AgentControllers.verifyAgent);

export const AgentRoutes = router;
