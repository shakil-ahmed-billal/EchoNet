import express from 'express';
import auth from '../../middleware/auth.js';
import { PropertyControllers } from './property.controller.js';
import { upload } from '../../middleware/multer.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), upload.array('images', 10), PropertyControllers.createProperty);
router.get('/', PropertyControllers.getAllProperties);
router.get('/my-properties', auth('USER', 'ADMIN', 'MODERATOR'), PropertyControllers.getMyProperties);
router.get('/:id', PropertyControllers.getPropertyById);
router.put('/:id', auth('USER', 'ADMIN', 'MODERATOR'), upload.array('images', 10), PropertyControllers.updateProperty);
router.delete('/:id', auth('USER', 'ADMIN', 'MODERATOR'), PropertyControllers.deleteProperty);

router.put('/:id/approve', auth('ADMIN'), PropertyControllers.approveProperty);
router.put('/:id/reject', auth('ADMIN'), PropertyControllers.rejectProperty);

export const PropertyRoutes = router;
