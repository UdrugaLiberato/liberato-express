import { Router } from 'express';
import {
  getAllLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationsByCityAndCategory,
  getLocationByCityAndCategoryAndName,
  getLocationBySlug,
} from '../controllers/location-controller';
import { locationImagesUpload } from '../middleware/upload';

const router = Router();

// Public routes - order matters! Specific routes first, then parameterized routes
router.get('/', getAllLocations);
router.get('/slug/:slug', getLocationBySlug);
router.get('/:city/:category/:name', getLocationByCityAndCategoryAndName);
router.get('/:city/:category', getLocationsByCityAndCategory);
router.get('/:id', getLocation);

// Protected routes (authentication will be added later)
router.post('/', locationImagesUpload.array('images', 5), createLocation);
router.put('/:id', locationImagesUpload.array('images', 5), updateLocation);
router.delete('/:id', deleteLocation);

export default router;
