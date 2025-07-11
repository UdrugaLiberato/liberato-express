import express from 'express';
import {
  getAllEmails,
  getEmail,
  createEmail,
  updateEmail,
} from '../controllers/email-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllEmails);
router.get('/:id', authenticate, checkPermissions, getEmail);
router.post('/', authenticate, checkPermissions, createEmail);
router.put('/:id', authenticate, checkPermissions, updateEmail);

export default router;
