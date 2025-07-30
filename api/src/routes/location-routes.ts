import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import upload from '../middleware/upload';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/location-controller';

const router = Router();

router.get('/', getLocations);
router.get('/:id', getLocation);
router.post('/', authenticate, upload.array('images', 5), createLocation);
router.put('/:id', authenticate, upload.array('images', 5), updateLocation);
router.delete('/:id', authenticate, deleteLocation);

export default router;
