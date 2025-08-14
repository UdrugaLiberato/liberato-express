import prisma from '../config/prisma';
import { VoteType } from '@prisma/client';

export interface VoteStats {
  upvotes: number;
  downvotes: number;
  userVote?: VoteType;
}

export const createOrUpdateVote = async (
  userId: string,
  locationId: string,
  voteType: VoteType,
): Promise<void> => {
  if (!userId || !locationId || !voteType) {
    throw new Error('User ID, location ID, and vote type are required');
  }

  await prisma.vote.upsert({
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
    },
  });
};

export const removeVote = async (
  userId: string,
  locationId: string,
): Promise<void> => {
  if (!userId || !locationId) {
    throw new Error('User ID and location ID are required');
  }

  await prisma.vote.delete({
    where: {
      userId_locationId: {
        userId,
        locationId,
      },
    },
  });
};

export const getLocationVoteStats = async (
  locationId: string,
  userId?: string,
): Promise<VoteStats> => {
  if (!locationId) {
    throw new Error('Location ID is required');
  }

  const votes = await prisma.vote.findMany({
    where: {
      locationId,
      deletedAt: null,
    },
    select: {
      voteType: true,
      userId: true,
    },
  });

  const upvotes = votes.filter((vote) => vote.voteType === 'upvote').length;
  const downvotes = votes.filter((vote) => vote.voteType === 'downvote').length;
  const userVote = userId
    ? votes.find((vote) => vote.userId === userId)?.voteType
    : undefined;

  return {
    upvotes,
    downvotes,
    userVote,
  };
};

export const getUserVoteForLocation = async (
  userId: string,
  locationId: string,
): Promise<VoteType | null> => {
  if (!userId || !locationId) {
    throw new Error('User ID and location ID are required');
  }

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

  return vote?.voteType || null;
};

export const getLocationVoters = async (locationId: string) => {
  if (!locationId) {
    throw new Error('Location ID is required');
  }

  const votes = await prisma.vote.findMany({
    where: {
      locationId,
      deletedAt: null,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Filter out votes with null users and map the rest
  const validVotes = votes.filter((vote) => vote.user !== null);

  const upvoters = validVotes
    .filter((vote) => vote.voteType === 'upvote')
    .map((vote) => ({
      user: vote.user!,
      votedAt: vote.createdAt,
    }));

  const downvoters = validVotes
    .filter((vote) => vote.voteType === 'downvote')
    .map((vote) => ({
      user: vote.user!,
      votedAt: vote.createdAt,
    }));

  return {
    upvoters,
    downvoters,
    totalUpvotes: upvoters.length,
    totalDownvotes: downvoters.length,
  };
};
