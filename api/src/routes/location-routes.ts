import { Router } from 'express';

import { locationImagesUpload } from '../middleware/upload';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationByCityAndCategoryAndName,
  getLocationsByCityAndCategory,
  getLocationBySlug,
} from '../controllers/location-controller';
import cache from '../middleware/cache';

const router = Router();

router.get('/', cache, getLocations);
router.get('/name/:slug', getLocationBySlug);
router.get('/:id', getLocation);
router.post(
  '/',
  locationImagesUpload.array('images', 5),
  createLocation,
);
router.put(
  '/:id',
  locationImagesUpload.array('images', 5),
  updateLocation,
);
router.delete('/:id', deleteLocation);
router.get('/:city/:category/:name', getLocationByCityAndCategoryAndName);
router.get('/:city/:category', getLocationsByCityAndCategory);

export default router;
