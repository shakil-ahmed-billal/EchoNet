import express from 'express';
import auth from '../../middleware/auth.js';
import { EnquiryControllers } from './enquiry.controller.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), EnquiryControllers.sendEnquiry);
router.get('/my-enquiries', auth('USER', 'ADMIN', 'MODERATOR'), EnquiryControllers.getMyEnquiries);
router.put('/:id/read', auth('USER', 'ADMIN', 'MODERATOR'), EnquiryControllers.markAsRead);

export const EnquiryRoutes = router;
