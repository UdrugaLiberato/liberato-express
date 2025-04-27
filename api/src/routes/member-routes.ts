import express from 'express';
import {
  getAllMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember
} from '../controllers/member-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllMembers);
router.get('/:id', authenticate, checkPermissions, getMember);
router.post('/', authenticate, checkPermissions, createMember);
router.put('/:id', authenticate, checkPermissions, updateMember);
router.delete('/:id', authenticate, checkPermissions, deleteMember);

export default router;