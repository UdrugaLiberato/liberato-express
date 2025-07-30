import { Router } from 'express';
import {
  getAllImages,
  getImage,
  createImage,
  updateImage,
  deleteImage,
} from '../controllers/image-controller';
import authenticate from '../middleware/authenticate';
import checkPermissions from '../middleware/check-permissions';

const router = Router();

router.get('/', getAllImages);
router.get('/:id', getImage);
router.post('/', authenticate, checkPermissions, createImage);
router.put('/:id', authenticate, checkPermissions, updateImage);
router.delete('/:id', authenticate, checkPermissions, deleteImage);

export default router;
