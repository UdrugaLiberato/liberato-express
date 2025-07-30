import { Router } from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/user-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';

const router = Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.post('/', authenticate, checkPermissions, createUser);
router.put('/:id', authenticate, checkPermissions, updateUser);
router.delete('/:id', authenticate, checkPermissions, deleteUser);

export default router;
