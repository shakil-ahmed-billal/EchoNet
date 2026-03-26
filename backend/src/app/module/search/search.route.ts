import { Router } from 'express';
import { SearchControllers } from './search.controller.js';
import auth from '../../middleware/auth.js';

const router = Router();

router.get('/', SearchControllers.globalSearch);

export const SearchRoutes = router;
