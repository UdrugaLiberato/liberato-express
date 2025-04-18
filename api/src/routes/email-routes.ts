import express from 'express';
import {
  getAllEmails,
  getEmail,
  createEmail,
  updateEmail,
} from '../controllers/email-controller';

const router = express.Router();

router.get('/', getAllEmails);
router.get('/:id', getEmail);
router.post('/', createEmail);
router.put('/:id', updateEmail);

export default router;