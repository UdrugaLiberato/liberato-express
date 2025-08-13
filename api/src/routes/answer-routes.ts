import { Router } from 'express';
import {
  getAllAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from '../controllers/answer-controller';

const router = Router();

router.get('/', getAllAnswers);
router.get('/:id', getAnswer);
router.post('/', createAnswer);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer);

export default router;
