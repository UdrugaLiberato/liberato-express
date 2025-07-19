import { Router, RequestHandler } from 'express';

import * as CityController from '../controllers/city-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = Router();

router.get(
  '/:id',
  authenticate,
  checkPermissions,
  CityController.getCity as RequestHandler,
);

router.get('/:name', CityController.getCityByName as RequestHandler);

router.get(
  '/',
  authenticate,
  checkPermissions,
  CityController.getCities as RequestHandler,
);
router.post(
  '/',
  authenticate,
  checkPermissions,
  CityController.createCity as RequestHandler,
);
router.put(
  '/:id',
  authenticate,
  checkPermissions,
  CityController.updateCity as RequestHandler,
);
router.delete(
  '/:id',
  authenticate,
  checkPermissions,
  CityController.deleteCity as RequestHandler,
);

export default router;
