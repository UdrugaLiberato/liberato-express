import { Request, Response } from 'express';
import { VoteService } from '../services/vote-service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/controller-utils';

export const createVote = async (req: Request, res: Response) => {
  try {
    const { location_id, vote_type } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const vote = await VoteService.createVote(
      { location_id, vote_type },
      userId,
    );

    sendCreated(res, vote);
  } catch (error) {
    console.error('Error in createVote:', error);
    res.status(500).json({ error: 'Failed to create vote' });
  }
};

// Legacy export for backward compatibility
export const createOrUpdateVote = createVote;

export const deleteVote = async (req: Request, res: Response) => {
  try {
    const { location_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    await VoteService.deleteVote(location_id, userId);
    sendNoContent(res);
  } catch (error) {
    console.error('Error in deleteVote:', error);
    res.status(500).json({ error: 'Failed to delete vote' });
  }
};

// Legacy export for backward compatibility
export const removeVote = deleteVote;

export const getVoteStats = async (req: Request, res: Response) => {
  try {
    const { location_id } = req.params;
    const userId = req.user?.id;

    const stats = await VoteService.getVoteStats(location_id, userId);
    sendSuccess(res, stats);
  } catch (error) {
    console.error('Error in getVoteStats:', error);
    res.status(500).json({ error: 'Failed to get vote stats' });
  }
};

export const getVotesByLocation = async (req: Request, res: Response) => {
  try {
    const { location_id } = req.params;

    const votes = await VoteService.getVotesByLocation(location_id);
    sendSuccess(res, votes);
  } catch (error) {
    console.error('Error in getVotesByLocation:', error);
    res.status(500).json({ error: 'Failed to get votes by location' });
  }
};

// Legacy export for backward compatibility
export const getLocationVotes = getVotesByLocation;

export const getVotesByUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const votes = await VoteService.getVotesByUser(userId);
    sendSuccess(res, votes);
  } catch (error) {
    console.error('Error in getVotesByUser:', error);
    res.status(500).json({ error: 'Failed to get votes by user' });
  }
};

// Legacy export for backward compatibility
export const getUserVote = async (req: Request, res: Response) => {
  try {
    const { location_id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const stats = await VoteService.getVoteStats(location_id, userId);
    sendSuccess(res, { userVote: stats.userVote });
  } catch (error) {
    console.error('Error in getUserVote:', error);
    res.status(500).json({ error: 'Failed to get user vote' });
  }
};

