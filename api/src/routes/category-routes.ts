import express from 'express';
import { Router, RequestHandler } from 'express';
import {
  getAllCategories,
  getCategory,
  createCategory,
  deleteCategory
} from '../controllers/category-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";
import {upload} from "../middleware/upload";

const router = express.Router();

router.get('/', getAllCategories);
router.get('/:id', authenticate, checkPermissions, getCategory);
router.post(
  '/',
  authenticate,
  checkPermissions,
  upload.single('image'),
  createCategory as RequestHandler
);

router.delete('/:id', authenticate, checkPermissions, deleteCategory);

export default router