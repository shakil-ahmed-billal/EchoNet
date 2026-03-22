import { Router } from 'express';
import { UploadControllers } from './upload.controller.js';
import { upload } from '../../middleware/multer.js';

const router = Router();

router.post('/', upload.single('file'), UploadControllers.uploadFile);

export const UploadRoutes = router;
