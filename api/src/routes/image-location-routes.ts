import express from 'express';
import {
  getLocationsByImage,
  createImageLocation,
  deleteImageLocation
} from '../controllers/image-location-controller';

const router = express.Router();

router.get('/:image_id', getLocationsByImage); // Get all locations for an image
router.post('/', createImageLocation);         // Create image-location link
router.delete('/:image_id/:location_id', deleteImageLocation); // Remove image-location link

export default router;