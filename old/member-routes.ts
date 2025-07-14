import express from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
} from './member-controller';
import {authenticate} from "../api/src/middleware/authenticate";
import {checkPermissions} from "../api/src/middleware/check-permissions";

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllMembers);
router.get('/:id', authenticate, checkPermissions, getMember);
router.post('/', authenticate, checkPermissions, createMember);
router.put('/:id', authenticate, checkPermissions, updateMember);
router.delete('/:id', authenticate, checkPermissions, deleteMember);

export default router;