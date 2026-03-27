import express from 'express';
import auth from '../../middleware/auth.js';
import { CategoryControllers } from './category.controller.js';

const router = express.Router();

router.get('/', CategoryControllers.getAllCategories);
router.get('/:id', CategoryControllers.getCategoryById);
router.post('/', auth('ADMIN'), CategoryControllers.createCategory);
router.put('/:id', auth('ADMIN'), CategoryControllers.updateCategory);
router.delete('/:id', auth('ADMIN'), CategoryControllers.deleteCategory);

export const CategoryRoutes = router;
