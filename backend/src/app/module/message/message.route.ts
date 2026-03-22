import express from 'express';
import { MessageControllers } from './message.controller.js';

const router = express.Router();

router.get('/:otherUserId', MessageControllers.getChatHistory);

export const MessageRoutes = router;
