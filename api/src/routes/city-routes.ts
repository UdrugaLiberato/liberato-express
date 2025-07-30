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

const router = Router();

router.get('/', getCities);
router.get('/:id', getCity);
router.get('/name/:name', getCityByName);
router.post('/', authenticate, checkPermissions, createCity);
router.put('/:id', authenticate, checkPermissions, updateCity);
router.delete('/:id', authenticate, checkPermissions, deleteCity);

export default router;
