import { Router, RequestHandler } from 'express';

import * as LocationController from '../controllers/location-controller';

const router = Router();

router.get('/:id', LocationController.getLocation as RequestHandler);
router.get('/', LocationController.getLocations as RequestHandler);
router.post('/', LocationController.createLocation as RequestHandler);
router.put('/:id', LocationController.updateLocation as RequestHandler);
router.delete('/:id', LocationController.deleteLocation as RequestHandler);

export default router;
