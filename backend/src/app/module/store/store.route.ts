import express from 'express';
import auth from '../../middleware/auth.js';
import { StoreControllers } from './store.controller.js';

const router = express.Router();

router.post('/', auth('USER', 'ADMIN', 'MODERATOR'), StoreControllers.createStore);
router.get('/my-store', auth('USER', 'ADMIN', 'MODERATOR'), StoreControllers.getMyStore);
router.get('/:id', StoreControllers.getStoreById);
router.put('/:id', auth('USER', 'ADMIN', 'MODERATOR'), StoreControllers.updateStore);
router.post('/:id/follow', auth('USER', 'ADMIN', 'MODERATOR'), StoreControllers.toggleFollowStore);

export const StoreRoutes = router;
