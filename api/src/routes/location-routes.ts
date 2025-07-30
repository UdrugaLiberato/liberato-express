import { Router, RequestHandler } from 'express';
import * as LocationController from '../controllers/location-controller';
import { authenticate } from '../middleware/authenticate';
import { upload } from '../middleware/upload';

const router = Router();

router.get(
  '/:city/:category',
  LocationController.getLocationsByCityAndCategory as RequestHandler,
);

router.get(
  '/:city/:category/:name',
  LocationController.getLocationByCityAndCategoryAndName as RequestHandler,
);

router.get(
  '/',
  authenticate,
  LocationController.getLocations as RequestHandler,
);

router.post(
  '/',
  upload.array('images'),
  LocationController.createLocation as RequestHandler,
);

router.put(
  '/:id',
  authenticate,
  upload.array('images'),
  LocationController.updateLocation as RequestHandler,
);

router.delete(
  '/:id',
  authenticate,
  LocationController.deleteLocation as RequestHandler,
);

export default router;
