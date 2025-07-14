import express from 'express';
import {
  getAllTasks,
  getTask,
  createTask,
  updateTask,
  // deleteTask
} from './task-controller';
import {authenticate} from "../api/src/middleware/authenticate";
import {checkPermissions} from "../api/src/middleware/check-permissions";

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllTasks);
router.get('/:id', authenticate, checkPermissions, getTask);
router.post('/', authenticate, checkPermissions, createTask);
router.put('/:id', authenticate, checkPermissions, updateTask);
// router.delete('/:id', deleteTask);

export default router;