import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  // deleteTask
} from '../controllers/task-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllTasks);
router.get('/:id', authenticate, checkPermissions, getTask);
router.post('/', authenticate, checkPermissions, createTask);
router.put('/:id', authenticate, checkPermissions, updateTask);
// router.delete('/:id', deleteTask);

export default router;
