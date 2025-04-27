import express from 'express';
import {
  getLocationsByImage,
  createImageLocation,
  deleteImageLocation
} from '../controllers/image-location-controller';
import {authenticate} from "../middleware/authenticate";
import {checkPermissions} from "../middleware/check-permissions";

const router = express.Router();

router.get('/:image_id', authenticate, checkPermissions, getLocationsByImage);
router.post('/', authenticate, checkPermissions, createImageLocation);
router.delete('/:image_id/:location_id', authenticate, checkPermissions, deleteImageLocation);

export default router;