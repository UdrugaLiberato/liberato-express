import { VoteStats } from '../types';

export const calculateVoteScore = (
  upvotes: number,
  downvotes: number,
): number => {
  return upvotes - downvotes;
};

export const calculateVotePercentage = (
  upvotes: number,
  downvotes: number,
): {
  upvotePercentage: number;
  downvotePercentage: number;
} => {
  const total = upvotes + downvotes;

  if (total === 0) {
    return {
      upvotePercentage: 0,
      downvotePercentage: 0,
    };
  }

  return {
    upvotePercentage: Math.round((upvotes / total) * 100),
    downvotePercentage: Math.round((downvotes / total) * 100),
  };
};

export const getVoteRating = (
  upvotes: number,
  downvotes: number,
): {
  rating: number;
  totalVotes: number;
  score: number;
} => {
  const totalVotes = upvotes + downvotes;
  const score = calculateVoteScore(upvotes, downvotes);

  // Calculate rating as a percentage of positive votes
  const rating = totalVotes > 0 ? (upvotes / totalVotes) * 100 : 0;

  return {
    rating: Math.round(rating * 100) / 100, // Round to 2 decimal places
    totalVotes,
    score,
  };
};

export const enhanceVoteStats = (
  stats: VoteStats,
): VoteStats & {
  score: number;
  upvotePercentage: number;
  downvotePercentage: number;
  rating: number;
} => {
  const { upvotes, downvotes } = stats;
  const score = calculateVoteScore(upvotes, downvotes);
  const percentages = calculateVotePercentage(upvotes, downvotes);
  const ratingData = getVoteRating(upvotes, downvotes);

  return {
    ...stats,
    score,
    ...percentages,
    rating: ratingData.rating,
  };
};

export const formatVoteDisplay = (
  upvotes: number,
  downvotes: number,
): string => {
  const score = calculateVoteScore(upvotes, downvotes);
  const total = upvotes + downvotes;

  if (total === 0) {
    return 'No votes yet';
  }

  return `${score > 0 ? '+' : ''}${score} (${upvotes}↑ ${downvotes}↓)`;
};

export const isVoteDataValid = (voteType: any): voteType is 1 | -1 => {
  return voteType === 1 || voteType === -1;
};

export const normalizeVoteType = (voteType: any): 1 | -1 | null => {
  if (
    voteType === 1 ||
    voteType === '1' ||
    voteType === 'upvote' ||
    voteType === 'up'
  ) {
    return 1;
  }
  if (
    voteType === -1 ||
    voteType === '-1' ||
    voteType === 'downvote' ||
    voteType === 'down'
  ) {
    return -1;
  }
  return null;
};

