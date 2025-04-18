import express from 'express';
import {
  getAllImages,
  getImage,
  createImage,
  updateImage,
  deleteImage
} from '../controllers/image-controller';

const router = express.Router();

router.get('/', getAllImages);
router.get('/:id', getImage);
router.post('/', createImage);
router.put('/:id', updateImage);
router.delete('/:id', deleteImage);

export default router;