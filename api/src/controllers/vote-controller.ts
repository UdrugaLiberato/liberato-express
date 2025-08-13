import { Request, Response } from 'express';
import * as VoteService from '../services/vote-service';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  sendUnauthorized,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';
import { VoteData } from '../types';

export const createOrUpdateVote = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      sendUnauthorized(res, 'Authentication required to vote');
      return;
    }

    const { locationId, voteType } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, [
      'locationId',
      'voteType',
    ]);
    if (missingFields.length > 0) {
      handleValidationError(res, missingFields);
      return;
    }

    // Validate vote type
    if (voteType !== 1 && voteType !== -1) {
      sendBadRequest(res, 'Vote type must be 1 (upvote) or -1 (downvote)');
      return;
    }

    const voteData: VoteData = {
      locationId,
      voteType,
    };

    const vote = await VoteService.createOrUpdateVote(req.user.id, voteData);
    sendCreated(res, vote);
  } catch (error: any) {
    if (error.message === 'Location not found or not published') {
      sendNotFound(res, error.message);
      return;
    }
    handleError(res, error, 'Failed to create or update vote');
  }
};

export const removeVote = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      sendUnauthorized(res, 'Authentication required to remove vote');
      return;
    }

    const { locationId } = req.params;

    if (!locationId) {
      sendBadRequest(res, 'Location ID is required');
      return;
    }

    await VoteService.removeVote(req.user.id, locationId);
    sendNoContent(res);
  } catch (error: any) {
    if (error.message === 'Vote not found') {
      sendNotFound(res, error.message);
      return;
    }
    handleError(res, error, 'Failed to remove vote');
  }
};

export const getVoteStats = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    if (!locationId) {
      sendBadRequest(res, 'Location ID is required');
      return;
    }

    // Include user's vote if authenticated
    const userId = req.user?.id;
    const stats = await VoteService.getVoteStats(locationId, userId);
    sendSuccess(res, stats);
  } catch (error) {
    handleError(res, error, 'Failed to get vote statistics');
  }
};

export const getUserVote = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      sendUnauthorized(res, 'Authentication required to get user vote');
      return;
    }

    const { locationId } = req.params;

    if (!locationId) {
      sendBadRequest(res, 'Location ID is required');
      return;
    }

    const userVote = await VoteService.getUserVote(req.user.id, locationId);
    sendSuccess(res, { userVote });
  } catch (error) {
    handleError(res, error, 'Failed to get user vote');
  }
};

export const getLocationVotes = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { limit = '50', offset = '0' } = req.query;

    if (!locationId) {
      sendBadRequest(res, 'Location ID is required');
      return;
    }

    const limitNum = Number.parseInt(limit as string, 10);
    const offsetNum = Number.parseInt(offset as string, 10);

    if (Number.isNaN(limitNum) || Number.isNaN(offsetNum) || limitNum <= 0 || offsetNum < 0) {
      sendBadRequest(res, 'Invalid limit or offset parameters');
      return;
    }

    const votes = await VoteService.getLocationVotes(
      locationId,
      limitNum,
      offsetNum,
    );
    sendSuccess(res, votes);
  } catch (error) {
    handleError(res, error, 'Failed to get location votes');
  }
};

