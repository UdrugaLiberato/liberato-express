import { Router, RequestHandler } from 'express';

import * as LocationController from '../controllers/location-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";
import { upload } from '../middleware/upload';

const router = Router();

router.get('/:id', authenticate, checkPermissions, LocationController.getLocation as RequestHandler);
router.get('/', authenticate, checkPermissions, LocationController.getLocations as RequestHandler);
router.post(
  '/',
  authenticate,
  checkPermissions,
  upload.array('images'),
  LocationController.createLocation as RequestHandler
);
router.put('/:id', authenticate, checkPermissions, LocationController.updateLocation as RequestHandler);
router.delete('/:id', authenticate, checkPermissions, LocationController.deleteLocation as RequestHandler);

router.post(
  '/:id/images',
  authenticate,
  checkPermissions,
  upload.array('images'),
  LocationController.addLocationImage as RequestHandler
);

router.delete(
  '/:id/images',
  authenticate,
  checkPermissions,
  LocationController.removeLocationImage as RequestHandler
);


export default router;
