import { Router } from 'express';
import {
  createOrUpdateVote,
  removeVote,
  getVoteStats,
  getUserVote,
  getLocationVotes,
} from '../controllers/vote-controller';

const router = Router();

// Create or update a vote
router.post('/', createOrUpdateVote);

// Remove a vote for a specific location
router.delete('/:locationId', removeVote);

// Get vote statistics for a location (includes user's vote if authenticated)
router.get('/location/:locationId/stats', getVoteStats);

// Get current user's vote for a specific location (requires authentication)
router.get('/user/:locationId', getUserVote);

// Get all votes for a location (paginated)
router.get('/location/:locationId', getLocationVotes);

export default router;

