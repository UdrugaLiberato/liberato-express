import express from 'express';
import {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/user-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";

const router = express.Router()

router.get('/', authenticate, checkPermissions, getAllUsers);
router.get('/:id', authenticate, checkPermissions, getUser);
router.post('/', authenticate, checkPermissions, createUser);
router.put('/:id', authenticate, checkPermissions, updateUser);
router.delete('/:id', authenticate, checkPermissions, deleteUser);

export default router