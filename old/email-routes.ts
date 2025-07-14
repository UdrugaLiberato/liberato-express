import express from 'express';
import {
  getAllEmails,
  getEmail,
  createEmail,
  updateEmail,
} from './email-controller';
import {authenticate} from "../api/src/middleware/authenticate";
import {checkPermissions} from "../api/src/middleware/check-permissions";

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllEmails);
router.get('/:id', authenticate, checkPermissions, getEmail);
router.post('/', authenticate, checkPermissions, createEmail);
router.put('/:id', authenticate, checkPermissions, updateEmail);

export default router;