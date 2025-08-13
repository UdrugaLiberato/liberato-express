import prisma from '../config/prisma';
import { VoteData, VoteStats, VoteResponse } from '../types';

class VoteServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'VoteServiceError';
  }
}

export const createOrUpdateVote = async (
  userId: string,
  voteData: VoteData,
): Promise<VoteResponse> => {
  try {
    const { locationId, voteType } = voteData;

    // Validate vote type
    if (voteType !== 1 && voteType !== -1) {
      throw new VoteServiceError(
        'Invalid vote type. Must be 1 (upvote) or -1 (downvote)',
      );
    }

    // Check if location exists
    const locationExists = await prisma.location.findFirst({
      where: {
        id: locationId,
        published: 1,
        deletedAt: null,
      },
    });

    if (!locationExists) {
      throw new VoteServiceError('Location not found or not published');
    }

    // Use upsert to handle both create and update cases
    const vote = await prisma.vote.upsert({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
      update: {
        voteType,
        updatedAt: new Date(),
      },
      create: {
        userId,
        locationId,
        voteType,
        createdAt: new Date(),
      },
    });

    return {
      id: vote.id,
      userId: vote.userId,
      locationId: vote.locationId,
      voteType: vote.voteType as 1 | -1,
      createdAt: vote.createdAt,
      updatedAt: vote.updatedAt || undefined,
    };
  } catch (error) {
    if (error instanceof VoteServiceError) {
      throw error;
    }
    throw new VoteServiceError(
      'Failed to create or update vote',
      'DATABASE_ERROR',
    );
  }
};

export const removeVote = async (
  userId: string,
  locationId: string,
): Promise<void> => {
  try {
    const deletedVote = await prisma.vote.deleteMany({
      where: {
        userId,
        locationId,
      },
    });

    if (deletedVote.count === 0) {
      throw new VoteServiceError('Vote not found');
    }
  } catch (error) {
    if (error instanceof VoteServiceError) {
      throw error;
    }
    throw new VoteServiceError('Failed to remove vote', 'DATABASE_ERROR');
  }
};

export const getVoteStats = async (
  locationId: string,
  userId?: string,
): Promise<VoteStats> => {
  try {
    // Get vote counts using aggregation
    const [upvoteCount, downvoteCount, userVote] = await Promise.all([
      prisma.vote.count({
        where: {
          locationId,
          voteType: 1,
        },
      }),
      prisma.vote.count({
        where: {
          locationId,
          voteType: -1,
        },
      }),
      userId
        ? prisma.vote.findUnique({
            where: {
              userId_locationId: {
                userId,
                locationId,
              },
            },
            select: {
              voteType: true,
            },
          })
        : null,
    ]);

    return {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      totalVotes: upvoteCount + downvoteCount,
      userVote: userVote ? (userVote.voteType as 1 | -1) : null,
    };
  } catch {
    throw new VoteServiceError(
      'Failed to get vote statistics',
      'DATABASE_ERROR',
    );
  }
};

export const getUserVote = async (
  userId: string,
  locationId: string,
): Promise<1 | -1 | null> => {
  try {
    const vote = await prisma.vote.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
      select: {
        voteType: true,
      },
    });

    return vote ? (vote.voteType as 1 | -1) : null;
  } catch {
    throw new VoteServiceError('Failed to get user vote', 'DATABASE_ERROR');
  }
};

export const getLocationVotes = async (
  locationId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<VoteResponse[]> => {
  try {
    const votes = await prisma.vote.findMany({
      where: {
        locationId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    return votes.map((vote) => ({
      id: vote.id,
      userId: vote.userId,
      locationId: vote.locationId,
      voteType: vote.voteType as 1 | -1,
      createdAt: vote.createdAt,
      updatedAt: vote.updatedAt || undefined,
    }));
  } catch {
    throw new VoteServiceError(
      'Failed to get location votes',
      'DATABASE_ERROR',
    );
  }
};

