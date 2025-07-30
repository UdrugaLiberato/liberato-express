import { Router } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  deleteCategory,
} from '../controllers/category-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';
import upload from '../middleware/upload';

const router = Router();

router.get('/', getAllCategories);
router.get('/:id', getCategory);
router.post(
  '/',
  authenticate,
  checkPermissions,
  upload.single('image'),
  createCategory,
);
router.delete('/:id', authenticate, checkPermissions, deleteCategory);

export default router;
