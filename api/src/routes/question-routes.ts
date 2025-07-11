import express from 'express';
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllQuestions);
router.get('/:id', authenticate, checkPermissions, getQuestion);
router.post('/', authenticate, checkPermissions, createQuestion);
router.put('/:id', authenticate, checkPermissions, updateQuestion);
router.delete('/:id', authenticate, checkPermissions, deleteQuestion);

export default router;
