import express from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category-controller';
// import { isAdmin } from '../middleware/auth'

const router = express.Router()

router.get('/', getAllCategories);
router.get('/:id', getCategory);
// router.post('/', isAdmin, createCategory)
// router.put('/:id', isAdmin, updateCategory)
// router.delete('/:id', isAdmin, deleteCategory)

export default router