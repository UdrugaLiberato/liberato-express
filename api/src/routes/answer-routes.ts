import { Router } from 'express';
import {
  getAllAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from '../controllers/answer-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';

const router = Router();

router.get('/', getAllAnswers);
router.get('/:id', getAnswer);
router.post('/', authenticate, checkPermissions, createAnswer);
router.put('/:id', authenticate, checkPermissions, updateAnswer);
router.delete('/:id', authenticate, checkPermissions, deleteAnswer);

export default router;
