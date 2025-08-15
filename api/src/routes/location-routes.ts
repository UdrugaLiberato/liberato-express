import { Router } from 'express';
import { requireAuth } from '@clerk/express';

import { locationImagesUpload } from '../middleware/upload';
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationBySlug,
} from '../controllers/location-controller';
import {
  voteOnLocation,
  removeVoteFromLocation,
  getLocationVotes,
  getLocationVoters,
} from '../controllers/vote-controller';
import cache from '../middleware/cache';

const router = Router();

router.get('/', cache, getLocations);
router.get('/name/:slug', getLocationBySlug);

// Voting routes (must come before /:id to avoid conflicts)
router.post('/:locationId/vote', requireAuth(), voteOnLocation);
router.delete('/:locationId/vote', requireAuth(), removeVoteFromLocation);
router.get('/:locationId/votes', getLocationVotes);
router.get('/:locationId/voters', getLocationVoters);

router.get('/:id', getLocation);
router.post('/', locationImagesUpload.array('images', 5), createLocation);
router.put('/:id', locationImagesUpload.array('images', 5), updateLocation);
router.delete('/:id', deleteLocation);

export default router;
