import { Router, RequestHandler } from 'express';

import * as CityController from '../controllers/city-controller';

const router = Router();

router.get('/:id', CityController.getCity as RequestHandler);
router.get('/', CityController.getCities as RequestHandler);
router.post('/', CityController.createCity as RequestHandler);
router.put('/:id', CityController.updateCity as RequestHandler);
router.delete('/:id', CityController.deleteCity as RequestHandler);

export default router;
