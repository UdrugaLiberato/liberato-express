import { Router } from 'express';
import {
  getAllSponsors,
  getSponsor,
  createSponsor,
  updateSponsor,
  deleteSponsor,
} from '../controllers/sponsor-controller';

import { sponsorImageUpload } from '../middleware/upload';

const router = Router();

router.get('/', getAllSponsors);
router.get('/:id', getSponsor);
router.post(
  '/',
  sponsorImageUpload.fields([
    { name: 'light_image', maxCount: 1 },
    { name: 'dark_image', maxCount: 1 },
  ]),
  createSponsor,
);
router.put(
  '/:id',
  sponsorImageUpload.fields([
    { name: 'light_image', maxCount: 1 },
    { name: 'dark_image', maxCount: 1 },
  ]),
  updateSponsor,
);
router.delete('/:id', deleteSponsor);

export default router;
