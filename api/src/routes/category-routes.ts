import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', authenticate, checkPermissions, getCategory);
router.post('/', authenticate, checkPermissions, createCategory)
router.put('/:id', authenticate, checkPermissions, updateCategory)
router.delete('/:id', authenticate, checkPermissions, deleteCategory)

export default router