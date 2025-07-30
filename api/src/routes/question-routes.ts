import { Router } from 'express';
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';

const router = Router();

router.get('/', getAllQuestions);
router.get('/:id', getQuestion);
router.post('/', authenticate, checkPermissions, createQuestion);
router.put('/:id', authenticate, checkPermissions, updateQuestion);
router.delete('/:id', authenticate, checkPermissions, deleteQuestion);

export default router;
