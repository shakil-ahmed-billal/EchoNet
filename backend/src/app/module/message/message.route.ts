import express from 'express';
import { MessageControllers } from './message.controller.js';
import auth from '../../middleware/auth.js';

const router = express.Router();

router.post('/', auth(), MessageControllers.sendMessage);
router.get('/conversations', auth(), MessageControllers.getConversations);
router.get('/:otherUserId', auth(), MessageControllers.getChatHistory);
router.patch('/:senderId/read', auth(), MessageControllers.markAsRead);

export const MessageRoutes = router;
