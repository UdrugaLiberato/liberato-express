import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  deleteCategory,
  getCategoryBySlug,
} from '../controllers/category-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';
import { categoryImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getAllCategories);
router.get('/name/:slug', getCategoryBySlug);
router.get('/:id', getCategory);
router.post('/', categoryImageUpload.single('category_image'), createCategory);
router.delete('/:id', authenticate, checkPermissions, deleteCategory);

export default router;
