import { Router } from 'express';

import * as CityController from '../controllers/city-controller';
import { authenticate } from '../middleware/authenticate';
import { checkPermissions } from '../middleware/check-permissions';

const router = Router();

router.get('/:id', authenticate, checkPermissions, CityController.getCity);

router.get('/:name', CityController.getCityByName);

router.get('/', authenticate, checkPermissions, CityController.getCities);
router.post('/', authenticate, checkPermissions, CityController.createCity);
router.put('/:id', authenticate, checkPermissions, CityController.updateCity);
router.delete(
  '/:id',
  authenticate,
  checkPermissions,
  CityController.deleteCity,
);

export default router;
