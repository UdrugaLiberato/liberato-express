import express from 'express';

import {
  getAllVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer,
} from '../controllers/volunteer-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = express.Router();

router.get('/', authenticate, checkPermissions, getAllVolunteers);
router.get('/:id', authenticate, checkPermissions, getVolunteer);
router.post('/', authenticate, checkPermissions, createVolunteer);
router.put('/:id', authenticate, checkPermissions, updateVolunteer);
router.delete('/:id', authenticate, checkPermissions, deleteVolunteer);

export default router;
