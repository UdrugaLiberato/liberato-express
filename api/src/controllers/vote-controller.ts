import { Request, Response } from 'express';
import { VoteType } from '@prisma/client';
import * as VoteService from '../services/vote-service';
import { VoteData } from '../types';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
} from '../utils/controller-utils';
import { getAuth } from '@clerk/express';
import prisma from '../config/prisma';

export const voteOnLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { voteType }: VoteData = req.body;

    // Get user from Clerk
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found in database');
    }

    // Validate vote type
    if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
      return sendBadRequest(
        res,
        'Valid vote type (upvote/downvote) is required',
      );
    }

    // Validate location ID
    if (!locationId) {
      return sendBadRequest(res, 'Location ID is required');
    }

    await VoteService.createOrUpdateVote(
      user.id, // Use internal user ID instead of Clerk ID
      locationId,
      voteType as VoteType,
    );

    // Return updated vote stats
    const voteStats = await VoteService.getLocationVoteStats(
      locationId,
      user.id, // Use internal user ID here too
    );

    sendCreated(res, voteStats);
  } catch (error) {
    handleError(res, error, 'Failed to vote on location');
  }
};

export const removeVoteFromLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    // Get user from Clerk
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      return sendUnauthorized(res, 'Authentication required');
    }

    // Get the internal user ID from Clerk ID
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found in database');
    }

    // Validate location ID
    if (!locationId) {
      return sendBadRequest(res, 'Location ID is required');
    }

    await VoteService.removeVote(user.id, locationId);
    sendNoContent(res);
  } catch (error: any) {
    // Handle case where vote doesn't exist
    if (error.code === 'P2025') {
      return sendBadRequest(res, 'No vote found to remove');
    }
    handleError(res, error, 'Failed to remove vote');
  }
};

export const getLocationVotes = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    // Get user from Clerk (optional for this endpoint)
    const { userId: clerkUserId } = getAuth(req);
    let internalUserId: string | undefined;

    if (clerkUserId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: { id: true },
      });
      internalUserId = user?.id;
    }

    // Validate location ID
    if (!locationId) {
      return sendBadRequest(res, 'Location ID is required');
    }

    const voteStats = await VoteService.getLocationVoteStats(
      locationId,
      internalUserId,
    );
    sendSuccess(res, voteStats);
  } catch (error) {
    handleError(res, error, 'Failed to get location votes');
  }
};

export const getLocationVoters = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    // Validate location ID
    if (!locationId) {
      return sendBadRequest(res, 'Location ID is required');
    }

    const voters = await VoteService.getLocationVoters(locationId);
    sendSuccess(res, voters);
  } catch (error) {
    handleError(res, error, 'Failed to get location voters');
  }
};
