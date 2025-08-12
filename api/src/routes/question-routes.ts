import { Router } from 'express';
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question-controller';


const router = Router();

router.get('/', getAllQuestions);
router.get('/:id', getQuestion);
router.post('/', createQuestion);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

export default router;
