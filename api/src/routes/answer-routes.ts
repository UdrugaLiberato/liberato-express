import express from 'express';
import {
  getAllAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  deleteAnswer
} from '../controllers/answer-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';


const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllAnswers);
router.get('/:id', getAnswer);
router.post('/', createAnswer);
router.put('/:id', updateAnswer);
router.delete('/:id', deleteAnswer);

export default router;