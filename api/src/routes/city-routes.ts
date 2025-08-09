import { Router } from 'express';
import {
  getCities,
  getCity,
  getCityByName,
  createCity,
  updateCity,
  deleteCity,
} from '../controllers/city-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';
import { cityImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getCities);
router.get('/:id', getCity);
router.get('/name/:name', getCityByName);
router.post(
  '/',
  authenticate,
  checkPermissions,
  cityImageUpload.single('city_image'),
  createCity,
);
router.put(
  '/:id',
  authenticate,
  checkPermissions,
  cityImageUpload.single('city_image'),
  updateCity,
);
router.delete('/:id', authenticate, checkPermissions, deleteCity);

export default router;
