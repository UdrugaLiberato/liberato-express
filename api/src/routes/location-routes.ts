import { Router } from 'express';
import authenticate from '../middleware/authenticate';
import upload from '../middleware/upload';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationByCityAndCategoryAndName,
  getLocationsByCityAndCategory,
} from '../controllers/location-controller';
import cache from '../middleware/cache';

const router = Router();

router.get('/', cache, getLocations);
router.get('/:id', getLocation);
router.post('/', authenticate, upload.array('images', 5), createLocation);
router.put('/:id', authenticate, upload.array('images', 5), updateLocation);
router.delete('/:id', deleteLocation);
router.get('/:city/:category/:name', getLocationByCityAndCategoryAndName);
router.get('/:city/:category', getLocationsByCityAndCategory);

export default router;
