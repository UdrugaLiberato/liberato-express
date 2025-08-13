import prisma from '../config/prisma';

// Custom error class for vote utils
class VoteUtilsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'VoteUtilsError';
  }
}

export const validateVoteData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Vote data is required');
    return { isValid: false, errors };
  }

  if (!data.location_id || typeof data.location_id !== 'string') {
    errors.push('Valid location ID is required');
  }

  if (!data.vote_type || !['up', 'down'].includes(data.vote_type)) {
    errors.push('Vote type must be "up" or "down"');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const checkVoteExists = async (locationId: string, userId: string) => {
  try {
    if (!locationId || !userId) {
      throw new VoteUtilsError('Location ID and user ID are required', 'MISSING_PARAMS');
    }

    return await prisma.vote.findFirst({
      where: {
        locationId,
        userId,
      },
    });
  } catch (error) {
    console.error('Error in checkVoteExists:', error);
    if (error instanceof VoteUtilsError) {
      throw error;
    }
    throw new VoteUtilsError('Failed to check vote existence', 'CHECK_VOTE_ERROR');
  }
};

export const formatVoteResponse = (vote: any) => {
  try {
    if (!vote) {
      return null;
    }

    return {
      id: vote.id,
      location_id: vote.locationId,
      vote_type: vote.voteType === 1 ? 'up' : 'down',
      user_id: vote.userId,
      createdAt: vote.createdAt,
      updatedAt: vote.updatedAt,
      location: vote.location ? {
        id: vote.location.id,
        name: vote.location.name,
        slug: vote.location.slug,
      } : null,
    };
  } catch (error) {
    console.error('Error in formatVoteResponse:', error);
    return vote;
  }
};

export const calculateVoteStats = (votes: any[], userId?: string) => {
  try {
    if (!Array.isArray(votes)) {
      return {
        upvotes: 0,
        downvotes: 0,
        totalVotes: 0,
        userVote: null,
      };
    }

    const upvotes = votes.filter(vote => vote.voteType === 1).length;
    const downvotes = votes.filter(vote => vote.voteType === -1).length;
    const totalVotes = upvotes + downvotes;

    let userVote: 'up' | 'down' | null = null;
    if (userId) {
      const userVoteRecord = votes.find(vote => vote.userId === userId);
      if (userVoteRecord) {
        userVote = userVoteRecord.voteType === 1 ? 'up' : 'down';
      }
    }

    return {
      upvotes,
      downvotes,
      totalVotes,
      userVote,
    };
  } catch (error) {
    console.error('Error in calculateVoteStats:', error);
    return {
      upvotes: 0,
      downvotes: 0,
      totalVotes: 0,
      userVote: null,
    };
  }
};

