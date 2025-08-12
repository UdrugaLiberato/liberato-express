import { Router } from 'express';
import {
  getCities,
  getCity,
  getCityBySlug,
  createCity,
  updateCity,
  deleteCity,
} from '../controllers/city-controller';

import { cityImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getCities);
router.get('/:id', getCity);
router.get('/name/:slug', getCityBySlug);
router.post(
  '/',
  cityImageUpload.single('city_image'),
  createCity,
);
router.put(
  '/:id',
  cityImageUpload.single('city_image'),
  updateCity,
);
router.delete('/:id', deleteCity);

export default router;
