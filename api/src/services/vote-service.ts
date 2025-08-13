import prisma from '../config/prisma';
import { VoteData, VoteStats, VoteResponse } from '../types';

export const createVote = async (voteData: VoteData, userId: string) => {
  try {
    const { location_id, vote_type } = voteData;

    // Check if user already voted on this location
    const existingVote = await prisma.vote.findFirst({
      where: {
        locationId: location_id,
        userId: userId,
      },
    });

    if (existingVote) {
      // Update existing vote
      return prisma.vote.update({
        where: { id: existingVote.id },
        data: {
          voteType: vote_type === 'up' ? 1 : -1,
          updatedAt: new Date(),
        },
      });
    }

    // Create new vote
    return prisma.vote.create({
      data: {
        locationId: location_id,
        userId: userId,
        voteType: vote_type === 'up' ? 1 : -1,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in createVote:', error);
    throw new Error('Failed to create vote');
  }
};

export const getVoteStats = async (locationId: string, userId?: string): Promise<VoteStats> => {
  try {
    const votes = await prisma.vote.findMany({
      where: { locationId },
    });

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
    console.error('Error in getVoteStats:', error);
    throw new Error('Failed to get vote stats');
  }
};

export const deleteVote = async (locationId: string, userId: string) => {
  try {
    const vote = await prisma.vote.findFirst({
      where: {
        locationId,
        userId,
      },
    });

    if (!vote) {
      throw new Error('Vote not found');
    }

    return prisma.vote.delete({
      where: { id: vote.id },
    });
  } catch (error) {
    console.error('Error in deleteVote:', error);
    throw new Error('Failed to delete vote');
  }
};

export const getVotesByLocation = async (locationId: string): Promise<VoteResponse[]> => {
  try {
    const votes = await prisma.vote.findMany({
      where: { locationId },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return votes.map((vote) => ({
      id: vote.id,
      location_id: vote.locationId,
      vote_type: vote.voteType === 1 ? 'up' : 'down',
      user_id: vote.userId,
      createdAt: vote.createdAt,
      location: vote.location ? {
        id: vote.location.id,
        name: vote.location.name,
        slug: vote.location.slug,
      } as any : undefined,
    }));
  } catch (error) {
    console.error('Error in getVotesByLocation:', error);
    throw new Error('Failed to get votes by location');
  }
};

export const getVotesByUser = async (userId: string): Promise<VoteResponse[]> => {
  try {
    const votes = await prisma.vote.findMany({
      where: { userId },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return votes.map((vote) => ({
      id: vote.id,
      location_id: vote.locationId,
      vote_type: vote.voteType === 1 ? 'up' : 'down',
      user_id: vote.userId,
      createdAt: vote.createdAt,
      location: vote.location ? {
        id: vote.location.id,
        name: vote.location.name,
        slug: vote.location.slug,
      } as any : undefined,
    }));
  } catch (error) {
    console.error('Error in getVotesByUser:', error);
    throw new Error('Failed to get votes by user');
  }
};

// Export as VoteService object for backward compatibility
export const VoteService = {
  createVote,
  getVoteStats,
  deleteVote,
  getVotesByLocation,
  getVotesByUser,
};

