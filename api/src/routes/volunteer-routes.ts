import express from 'express';

import {
  getAllVolunteers,
  getVolunteer,
  createVolunteer,
  updateVolunteer,
  deleteVolunteer
} from '../controllers/volunteer-controller';


const router = express.Router();

router.get('/', getAllVolunteers);
router.get('/:id', getVolunteer);
router.post('/', createVolunteer);
router.put('/:id', updateVolunteer);
router.delete('/:id', deleteVolunteer);

export default router;