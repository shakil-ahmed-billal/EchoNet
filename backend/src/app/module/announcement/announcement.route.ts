import express from 'express';
import { AnnouncementControllers } from './announcement.controller.js';

const router = express.Router();

router.post('/', AnnouncementControllers.createAnnouncement);
router.get('/', AnnouncementControllers.getAnnouncements);

export const AnnouncementRoutes = router;
