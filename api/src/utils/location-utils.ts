import prisma from '../config/prisma';
import googleMaps from './google-maps';
import {
  SimplifiedAnswer,
  LocationWithSimplifiedAnswers,
  VoteStats,
} from '../types';
import env from '../config/env';

// Constants for better maintainability
const DEFAULT_IMAGE_NAME = 'location-image';
const DEFAULT_MIME_TYPE = 'application/octet-stream';
const DEFAULT_IMAGE_BASE_URL =
  'https://dev.udruga-liberato.hr/images/location/';

// Custom error class for location utils
class LocationUtilsError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'LocationUtilsError';
  }
}

export const locationInclude = {
  answer: {
    include: {
      question: true,
    },
  },
  image: {
    where: {
      deletedAt: null,
    },
  },
  city: true,
  category: true,
};

export const locationIncludeWithVotes = {
  ...locationInclude,
  vote: {
    where: {
      deletedAt: null,
    },
    select: {
      voteType: true,
      userId: true,
    },
  },
};

export const simplifyAnswers = (answers: any[]): SimplifiedAnswer[] => {
  try {
    if (!Array.isArray(answers)) {
      return [];
    }

    return answers
      .filter((answer) => answer && answer.question) // Filter out invalid answers
      .map((answer) => ({
        answerId: answer.id,
        answer: answer.answer,
        questionId: answer.question.id,
        question: answer.question.question,
      }));
  } catch (error) {
    console.error('Error in simplifyAnswers:', error);
    return [];
  }
};

export const calculateVoteStats = (
  votes: any[],
  userId?: string,
): VoteStats => {
  try {
    if (!Array.isArray(votes)) {
      return { upvotes: 0, downvotes: 0 };
    }

    const upvotes = votes.filter((vote) => vote.voteType === 'upvote').length;
    const downvotes = votes.filter(
      (vote) => vote.voteType === 'downvote',
    ).length;
    const userVote = userId
      ? votes.find((vote) => vote.userId === userId)?.voteType
      : undefined;

    return {
      upvotes,
      downvotes,
      userVote,
    };
  } catch (error) {
    console.error('Error in calculateVoteStats:', error);
    return { upvotes: 0, downvotes: 0 };
  }
};

export const addSimplifiedAnswers = (
  location: any,
): LocationWithSimplifiedAnswers => {
  try {
    if (!location) {
      throw new LocationUtilsError(
        'Location data is required',
        'INVALID_LOCATION',
      );
    }

    const { answer, ...locationWithoutAnswer } = location;
    return {
      ...locationWithoutAnswer,
      answers: simplifyAnswers(answer || []),
    };
  } catch (error) {
    console.error('Error in addSimplifiedAnswers:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to add simplified answers',
      'ADD_ANSWERS_ERROR',
    );
  }
};

// Helper function to convert various types to integer
export const toInt = (value: any): number => {
  try {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number.parseInt(value, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  } catch (error) {
    console.error('Error in toInt:', error);
    return 0;
  }
};

// Helper function to generate slug from name
const generateSlug = (name: string): string => {
  try {
    if (!name || typeof name !== 'string') {
      return '';
    }

    return name
      .toLowerCase()
      .trim()
      .replaceAll(/[^\s\w-]/g, '') // Remove special characters
      .replaceAll(/\s+/g, '-') // Replace spaces with hyphens
      .replaceAll(/-+/g, '-') // Replace multiple hyphens with single
      .replaceAll(/(^-)|(-$)/g, ''); // Remove leading/trailing hyphens
  } catch (error) {
    console.error('Error in generateSlug:', error);
    return name || '';
  }
};

// Helper function to generate unique slug for location
export const getUniqueSlug = async (
  name: string,
  cityId: string,
  categoryId: string,
): Promise<string> => {
  try {
    if (!name || !cityId || !categoryId) {
      throw new LocationUtilsError(
        'Name, city ID, and category ID are required',
        'MISSING_SLUG_PARAMS',
      );
    }

    const baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug and generate unique one

    while (true) {
      // eslint-disable-next-line no-await-in-loop
      const existingLocation = await prisma.location.findFirst({
        where: {
          slug,
          cityId,
          categoryId,
          deletedAt: null,
        },
        select: { id: true },
      });

      if (!existingLocation) {
        break;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;

      // Prevent infinite loop
      if (counter > 100) {
        throw new LocationUtilsError(
          'Unable to generate unique slug',
          'SLUG_GENERATION_FAILED',
        );
      }
    }

    return slug;
  } catch (error) {
    console.error('Error in getUniqueSlug:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to generate unique slug',
      'SLUG_ERROR',
    );
  }
};

export const addSimplifiedAnswersWithVotes = (
  location: any,
  userId?: string,
): LocationWithSimplifiedAnswers & { votes?: VoteStats } => {
  try {
    if (!location) {
      throw new LocationUtilsError(
        'Location data is required',
        'INVALID_LOCATION',
      );
    }

    const { answer, vote, ...locationWithoutAnswerAndVote } = location;
    const result: LocationWithSimplifiedAnswers & { votes?: VoteStats } = {
      ...locationWithoutAnswerAndVote,
      answers: simplifyAnswers(answer || []),
    };

    if (vote) {
      result.votes = calculateVoteStats(vote, userId);
    }

    return result;
  } catch (error) {
    console.error('Error in addSimplifiedAnswersWithVotes:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to add simplified answers with votes',
      'ADD_ANSWERS_VOTES_ERROR',
    );
  }
};

export const getCoordinates = async (address: string) => {
  try {
    if (!address || typeof address !== 'string') {
      throw new LocationUtilsError(
        'Valid address is required',
        'INVALID_ADDRESS',
      );
    }

    return googleMaps.getCoordinateForStreet('', address);
  } catch (error) {
    console.error('Error in getCoordinates:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to get coordinates',
      'COORDINATES_ERROR',
    );
  }
};

export const createLocationImage = async (
  locationId: string,
  image: {
    path: string;
    name?: string;
    size?: number;
    fileType?: string;
  },
) => {
  try {
    if (!locationId) {
      throw new LocationUtilsError(
        'Location ID is required',
        'INVALID_LOCATION_ID',
      );
    }

    if (!image || !image.path) {
      throw new LocationUtilsError(
        'Valid image data is required',
        'INVALID_IMAGE_DATA',
      );
    }

    return prisma.image.create({
      data: {
        src: `${env.STORE_URL}${image.path}`,
        name: image.name || DEFAULT_IMAGE_NAME,
        mime: image.fileType || DEFAULT_MIME_TYPE,
        locationId,
      },
    });
  } catch (error) {
    console.error('Error in createLocationImage:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to create location image',
      'CREATE_IMAGE_ERROR',
    );
  }
};

export const createImages = async (
  files: Express.Multer.File[],
  locationId: string,
) => {
  try {
    if (!locationId) {
      throw new LocationUtilsError(
        'Location ID is required',
        'INVALID_LOCATION_ID',
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return [];
    }

    const imagePromises = files.map((file) => {
      if (!file.filename) {
        console.warn('Skipping file without filename:', file);
        return null;
      }

      return prisma.image.create({
        data: {
          src: `${DEFAULT_IMAGE_BASE_URL}${file.filename}`,
          name: file.originalname?.split('.')[0] || DEFAULT_IMAGE_NAME,
          mime: file.mimetype || DEFAULT_MIME_TYPE,
          locationId,
        },
      });
    });

    const results = await Promise.all(imagePromises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error('Error in createImages:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to create images',
      'CREATE_IMAGES_ERROR',
    );
  }
};

export const createAnswers = async (answers: string, locationId: string) => {
  try {
    if (!locationId) {
      throw new LocationUtilsError(
        'Location ID is required',
        'INVALID_LOCATION_ID',
      );
    }

    if (!answers || typeof answers !== 'string') {
      return [];
    }

    const items = answers
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (items.length === 0) {
      return [];
    }

    const answerPromises = items.map(async (item) => {
      const [questionId, answer] = item.split(':');

      if (!questionId || answer === undefined) {
        console.warn('Invalid answer format:', item);
        return null;
      }

      return prisma.answer.create({
        data: {
          question: { connect: { id: questionId } },
          location: { connect: { id: locationId } },
          answer: answer === 'true' ? 1 : 0,
          createdAt: new Date(),
        },
      });
    });

    const results = await Promise.all(answerPromises);
    return results.filter((result) => result !== null);
  } catch (error) {
    console.error('Error in createAnswers:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to create answers',
      'CREATE_ANSWERS_ERROR',
    );
  }
};

export const buildLocationUpdateData = async (
  body: any,
  currentLocation: any,
) => {
  try {
    if (!body) {
      throw new LocationUtilsError(
        'Update data is required',
        'INVALID_UPDATE_DATA',
      );
    }

    if (!currentLocation) {
      throw new LocationUtilsError(
        'Current location data is required',
        'INVALID_CURRENT_LOCATION',
      );
    }

    const updateData: any = {};

    // Update basic fields if provided
    if (body.name !== undefined) {
      updateData.name = body.name;
    }

    if (body.street !== undefined) {
      updateData.street = body.street;
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone;
    }

    if (body.email !== undefined) {
      updateData.email = body.email;
    }

    if (body.about !== undefined) {
      updateData.about = body.about;
    }

    if (body.featured !== undefined) {
      updateData.featured = toInt(body.featured);
    }

    // Update relationships if provided
    if (body.category_id !== undefined) {
      updateData.category = { connect: { id: body.category_id } };
    }

    if (body.city_id !== undefined) {
      updateData.city = { connect: { id: body.city_id } };
    }

    // Generate new slug if name or relationships changed
    if (
      body.name !== undefined ||
      body.category_id !== undefined ||
      body.city_id !== undefined
    ) {
      const newName = body.name || currentLocation.name;
      const newCategoryId = body.category_id || currentLocation.categoryId;
      const newCityId = body.city_id || currentLocation.cityId;

      updateData.slug = await getUniqueSlug(newName, newCityId, newCategoryId);
    }

    updateData.updatedAt = new Date();

    return updateData;
  } catch (error) {
    console.error('Error in buildLocationUpdateData:', error);
    if (error instanceof LocationUtilsError) {
      throw error;
    }
    throw new LocationUtilsError(
      'Failed to build location update data',
      'BUILD_UPDATE_DATA_ERROR',
    );
  }
};

export const fromPascalWithDashes = (str: string): string => {
  try {
    if (!str || typeof str !== 'string') {
      return '';
    }

    return str
      .replaceAll(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '');
  } catch (error) {
    console.error('Error in fromPascalWithDashes:', error);
    return str || '';
  }
};

// New utility function: Validate location data
export const validateLocationData = (
  data: any,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data) {
    errors.push('Location data is required');
    return { isValid: false, errors };
  }

  if (
    !data.name ||
    typeof data.name !== 'string' ||
    data.name.trim().length === 0
  ) {
    errors.push('Valid name is required');
  }

  if (!data.city_id || typeof data.city_id !== 'string') {
    errors.push('Valid city ID is required');
  }

  if (!data.category_id || typeof data.category_id !== 'string') {
    errors.push('Valid category ID is required');
  }

  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }

  if (data.email && typeof data.email !== 'string') {
    errors.push('Email must be a string');
  }

  if (
    data.latitude !== undefined &&
    (typeof data.latitude !== 'number' || Number.isNaN(data.latitude))
  ) {
    errors.push('Latitude must be a valid number');
  }

  if (
    data.longitude !== undefined &&
    (typeof data.longitude !== 'number' || Number.isNaN(data.longitude))
  ) {
    errors.push('Longitude must be a valid number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// New utility function: Calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number => {
  try {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  } catch (error) {
    console.error('Error in calculateDistance:', error);
    return 0;
  }
};

// New utility function: Format location for display
export const formatLocationForDisplay = (location: any) => {
  try {
    if (!location) {
      return null;
    }

    return {
      id: location.id,
      name: location.name,
      slug: location.slug,
      street: location.street,
      phone: location.phone || null,
      email: location.email || null,
      about: location.about || null,
      latitude: location.latitude,
      longitude: location.longitude,
      featured: Boolean(location.featured),
      published: Boolean(location.published),
      createdAt: location.createdAt,
      updatedAt: location.updatedAt,
      city: location.city
        ? {
            id: location.city.id,
            name: location.city.name,
            slug: location.city.slug,
          }
        : null,
      category: location.category
        ? {
            id: location.category.id,
            name: location.category.name,
          }
        : null,
      images: Array.isArray(location.image)
        ? location.image.map((img: any) => ({
            id: img.id,
            src: img.src,
            name: img.name,
            mime: img.mime,
          }))
        : [],
      answers: Array.isArray(location.answers) ? location.answers : [],
    };
  } catch (error) {
    console.error('Error in formatLocationForDisplay:', error);
    return location;
  }
};
