import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  deleteCategory,
  getCategoryBySlug,
} from '../controllers/category-controller';

import { categoryImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getAllCategories);
router.get('/name/:slug', getCategoryBySlug);
router.get('/:id', getCategory);
router.post('/', categoryImageUpload.single('category_image'), createCategory);
router.delete('/:id', deleteCategory);

export default router;
