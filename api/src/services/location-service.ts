import prisma from '../config/prisma';
import { Express } from 'express';
import {
  locationInclude,
  locationIncludeWithVotes,
  addSimplifiedAnswers,
  addSimplifiedAnswersWithVotes,
  getCoordinates,
  createImages,
  createLocationImage,
  createAnswers,
  buildLocationUpdateData,
  toInt,
  fromPascalWithDashes,
  getUniqueSlug,
} from '../utils/location-utils';
import {
  LocationFilters,
  LocationCreateData,
  LocationUpdateData,
  UploadResponseData,
} from '../types';

// Constants for better maintainability
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PUBLISHED_STATUS = 1;

// Custom error class for location service
class LocationServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

// Helper function to build where clause for location queries
const buildLocationWhereClause = (filters: LocationFilters) => {
  const where: any = {
    published: DEFAULT_PUBLISHED_STATUS,
    deletedAt: null,
  };

  if (filters.city) {
    where.city = {
      slug: {
        mode: 'insensitive',
        contains: filters.city,
      },
    };
  }

  if (filters.category) {
    where.category = {
      slug: {
        mode: 'insensitive',
        contains: filters.category,
      },
    };
  }

  if (filters.name) {
    where.slug = {
      mode: 'insensitive',
      contains: filters.name,
    };
  }

  return where;
};

// Helper function to handle pagination
const handlePagination = <T>(items: T[], pageSize: number) => {
  const hasNextPage = items.length > pageSize;
  const nextCursor = hasNextPage ? items[pageSize - 1] : null;
  const itemsToReturn = hasNextPage ? items.slice(0, pageSize) : items;

  return {
    items: itemsToReturn,
    nextCursor,
    hasNextPage,
  };
};

export const getAllLocations = async (
  filters: LocationFilters,
  userId?: string,
) => {
  try {
    const { cursor, votes } = filters;
    const where = buildLocationWhereClause(filters);
    const includeVotes = votes === true;

    // Check if any filters are applied
    const hasFilters =
      filters.city !== undefined ||
      filters.category !== undefined ||
      filters.name !== undefined;

    if (hasFilters) {
      const locations = await prisma.location.findMany({
        where,
        ...(cursor ? { cursor: { id: cursor } } : undefined),
        take: DEFAULT_PAGE_SIZE + 1,
        include: includeVotes ? locationIncludeWithVotes : locationInclude,
        orderBy: { featured: 'desc' },
      });

      const { items: locationsToReturn, nextCursor } = handlePagination(
        locations,
        DEFAULT_PAGE_SIZE,
      );

      return {
        locations: locationsToReturn.map((location) =>
          includeVotes
            ? addSimplifiedAnswersWithVotes(location, userId)
            : addSimplifiedAnswers(location),
        ),
        nextCursor: nextCursor?.id || null,
      };
    }

    // No filters applied - return all locations with simplified select
    const selectFields = {
      id: true,
      cityId: true,
      name: true,
      street: true,
      featured: true,
      answer: {
        select: {
          id: true,
          answer: true,
          question: {
            select: {
              id: true,
              question: true,
            },
          },
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      city: {
        select: {
          id: true,
          name: true,
        },
      },
      image: {
        select: {
          id: true,
          src: true,
          mime: true,
          name: true,
        },
        where: {
          deletedAt: null,
        },
      },
      ...(includeVotes && {
        vote: {
          select: {
            voteType: true,
            userId: true,
          },
          where: {
            deletedAt: null,
          },
        },
      }),
    };

    const locations = await prisma.location.findMany({
      select: selectFields,
      where: {
        deletedAt: null,
      },
      ...(cursor ? { cursor: { id: cursor } } : undefined),
      take: DEFAULT_PAGE_SIZE + 1,
      orderBy: { featured: 'desc' },
    });

    const { items: locationsToReturn, nextCursor } = handlePagination(
      locations,
      DEFAULT_PAGE_SIZE,
    );

    return {
      locations: locationsToReturn.map((location) =>
        includeVotes
          ? addSimplifiedAnswersWithVotes(location, userId)
          : addSimplifiedAnswers(location),
      ),
      nextCursor: nextCursor?.id || null,
    };
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    throw new LocationServiceError(
      'Failed to retrieve locations',
      'GET_ALL_ERROR',
    );
  }
};

export const getLocationById = async (id: string, userId?: string) => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'INVALID_ID');
    }

    const location = await prisma.location.findUnique({
      where: { id },
      include: locationIncludeWithVotes,
    });

    return location ? addSimplifiedAnswersWithVotes(location, userId) : null;
  } catch (error) {
    console.error('Error in getLocationById:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to retrieve location by ID',
      'GET_BY_ID_ERROR',
    );
  }
};

export const getLocationBySlug = async (slug: string, userId?: string) => {
  try {
    if (!slug) {
      throw new LocationServiceError(
        'Location slug is required',
        'INVALID_SLUG',
      );
    }

    const location = await prisma.location.findFirst({
      where: {
        slug,
        deletedAt: null,
        published: DEFAULT_PUBLISHED_STATUS,
      },
      include: locationIncludeWithVotes,
    });

    return location ? addSimplifiedAnswersWithVotes(location, userId) : null;
  } catch (error) {
    console.error('Error in getLocationBySlug:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to retrieve location by slug',
      'GET_BY_SLUG_ERROR',
    );
  }
};

export const getLocationByCityAndCategoryAndName = async (
  filters: LocationFilters,
) => {
  try {
    let { city, category, name } = filters;

    if (!city || !category || !name) {
      throw new LocationServiceError(
        'City, category, and name are required',
        'MISSING_PARAMS',
      );
    }

    name = fromPascalWithDashes(name as string);

    // Normalize city and category names
    if (city.includes('-')) {
      city = city.replaceAll('-', ' ');
    }
    if (category.includes('-')) {
      category = category.replaceAll('-', ' ');
    }

    const where: any = {
      city: {
        name: {
          mode: 'insensitive',
          contains: city,
        },
      },
      category: {
        name: {
          mode: 'insensitive',
          contains: category,
        },
      },
      name: {
        mode: 'insensitive',
        contains: name,
      },
      published: DEFAULT_PUBLISHED_STATUS,
      deletedAt: null,
    };

    const location = await prisma.location.findFirst({
      where,
      include: locationInclude,
    });

    return location ? addSimplifiedAnswers(location) : null;
  } catch (error) {
    console.error('Error in getLocationByCityAndCategoryAndName:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to retrieve location by filters',
      'GET_BY_FILTERS_ERROR',
    );
  }
};

export const createLocation = async (
  body: LocationCreateData,
  files: Express.Multer.File[],
  userId: string,
) => {
  try {
    if (!body || !userId) {
      throw new LocationServiceError(
        'Location data and user ID are required',
        'INVALID_INPUT',
      );
    }

    // Validate required fields
    if (!body.name || !body.city_id || !body.category_id) {
      throw new LocationServiceError(
        'Name, city ID, and category ID are required',
        'MISSING_REQUIRED_FIELDS',
      );
    }

    const city = await prisma.city.findUnique({
      where: { id: body.city_id },
    });

    if (!city) {
      throw new LocationServiceError('City not found', 'CITY_NOT_FOUND');
    }

    // Get coordinates
    let coordinates;
    if (body.latitude && body.longitude) {
      coordinates = {
        lat: body.latitude,
        lng: body.longitude,
        formattedAddress: `${body.street} ${city.name}`,
      };
    } else {
      try {
        coordinates = await getCoordinates(`${body.street} ${city.name}`);
      } catch (error) {
        console.warn(
          'Geocoding failed, using city coordinates as fallback:',
          error,
        );
        // Fallback to default coordinates if geocoding fails
        coordinates = {
          lat: city.latitude,
          lng: city.longitude,
          formattedAddress: `${body.street} ${city.name}`,
        };
      }
    }

    // Generate unique slug for the location
    const slug = await getUniqueSlug(body.name, body.city_id, body.category_id);

    const location = await prisma.location.create({
      data: {
        category: { connect: { id: body.category_id } },
        city: { connect: { id: body.city_id } },
        user: { connect: { id: userId } },
        name: body.name,
        slug,
        street: coordinates.formattedAddress || `${body.street} ${city.name}`,
        phone: body.phone || '',
        email: body.email || '',
        about: body.about || '',
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        published: DEFAULT_PUBLISHED_STATUS,
        featured: toInt(body.featured || false),
        createdAt: new Date(),
      },
      include: {
        city: true,
        category: true,
        user: { select: { id: true, username: true } },
      },
    });

    // Process images and answers asynchronously
    const promises = [];

    if (files?.length) {
      promises.push(createImages(files, location.id));
    }

    if (body.qa) {
      promises.push(createAnswers(body.qa, location.id));
    }

    // Wait for all async operations to complete
    if (promises.length > 0) {
      await Promise.all(promises);
    }

    const fullLocation = await prisma.location.findUnique({
      where: { id: location.id },
      include: locationInclude,
    });

    return fullLocation ? addSimplifiedAnswers(fullLocation) : null;
  } catch (error) {
    console.error('Error in createLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to create location', 'CREATE_ERROR');
  }
};

// Helper function to update coordinates when street or city changes
const updateLocationCoordinates = async (
  body: LocationUpdateData,
  dataToUpdate: any,
) => {
  if (body.street === undefined && body.city_id === undefined) {
    return;
  }

  const city = body.city_id
    ? await prisma.city.findUnique({ where: { id: body.city_id } })
    : null;

  if (!city) {
    return;
  }

  try {
    const coordinates = await getCoordinates(
      `${body.street ?? ''} ${city.name}`,
    );
    dataToUpdate.latitude = coordinates.lat;
    dataToUpdate.longitude = coordinates.lng;
  } catch (error) {
    console.warn('Failed to update coordinates:', error);
  }
};

// Helper function to handle async update operations
const processLocationUpdates = async (
  id: string,
  body: LocationUpdateData,
  files: Express.Multer.File[],
) => {
  const promises = [];

  if (files?.length) {
    promises.push(
      prisma.image.deleteMany({ where: { locationId: id } }),
      createImages(files, id),
    );
  }

  if (body.qa) {
    promises.push(
      prisma.answer.deleteMany({ where: { locationId: id } }),
      createAnswers(body.qa, id),
    );
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
};

export const updateLocation = async (
  id: string,
  body: LocationUpdateData,
  files: Express.Multer.File[],
) => {
  try {
    if (!id || !body) {
      throw new LocationServiceError(
        'Location ID and update data are required',
        'INVALID_INPUT',
      );
    }

    const currentLocation = await prisma.location.findUnique({
      where: { id },
      select: { cityId: true, categoryId: true, id: true, name: true },
    });

    if (!currentLocation) {
      throw new LocationServiceError(
        'Location not found',
        'LOCATION_NOT_FOUND',
      );
    }

    const dataToUpdate = await buildLocationUpdateData(body, currentLocation);
    await updateLocationCoordinates(body, dataToUpdate);

    await prisma.location.update({
      where: { id },
      data: dataToUpdate,
      include: {
        city: true,
        category: true,
        user: { select: { id: true, username: true } },
      },
    });

    await processLocationUpdates(id, body, files);

    const fullLocation = await prisma.location.findUnique({
      where: { id },
      include: locationInclude,
    });

    return fullLocation ? addSimplifiedAnswers(fullLocation) : null;
  } catch (error) {
    console.error('Error in updateLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to update location', 'UPDATE_ERROR');
  }
};

export const updateWithImage = async (
  locationId: string,
  uploadResponseData: UploadResponseData,
) => {
  try {
    // Validate input parameters
    if (!locationId) {
      throw new LocationServiceError(
        'Location ID is required',
        'INVALID_LOCATION_ID',
      );
    }

    if (!uploadResponseData) {
      throw new LocationServiceError(
        'Upload response data is required',
        'INVALID_UPLOAD_DATA',
      );
    }

    if (
      !Array.isArray(uploadResponseData.files) ||
      uploadResponseData.files.length === 0
    ) {
      throw new LocationServiceError(
        'No files found in upload response data',
        'NO_FILES',
      );
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      select: { id: true },
    });

    if (!location) {
      throw new LocationServiceError(
        'Location not found',
        'LOCATION_NOT_FOUND',
      );
    }

    // Process all files in the upload response
    const imageCreationPromises = uploadResponseData.files
      .filter((file) => file.path) // Only process files with valid paths
      .map((file) => createLocationImage(locationId, file));

    if (imageCreationPromises.length === 0) {
      throw new LocationServiceError(
        'No valid file paths found in upload response',
        'NO_VALID_FILES',
      );
    }

    await Promise.all(imageCreationPromises);
  } catch (error) {
    console.error(
      `Error in updateWithImage for location ${locationId}:`,
      error,
    );
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to update location with images',
      'UPDATE_WITH_IMAGE_ERROR',
    );
  }
};

export const deleteLocation = async (id: string) => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'INVALID_ID');
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!location) {
      throw new LocationServiceError(
        'Location not found',
        'LOCATION_NOT_FOUND',
      );
    }

    return prisma.location.update({
      where: { id },
      data: {
        published: 0,
        deletedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to delete location', 'DELETE_ERROR');
  }
};

export const getFeaturedLocations = async (limit: number = 10) => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        featured: 1,
        published: DEFAULT_PUBLISHED_STATUS,
        deletedAt: null,
      },
      take: Math.min(limit, 50), // Cap at 50 for performance
      include: locationInclude,
      orderBy: { createdAt: 'desc' },
    });

    return locations.map((location) => addSimplifiedAnswers(location));
  } catch (error) {
    console.error('Error in getFeaturedLocations:', error);
    throw new LocationServiceError(
      'Failed to retrieve featured locations',
      'GET_FEATURED_ERROR',
    );
  }
};

// New method: Search locations by text
export const searchLocations = async (query: string, limit: number = 20) => {
  try {
    if (!query || query.trim().length < 2) {
      throw new LocationServiceError(
        'Search query must be at least 2 characters',
        'INVALID_QUERY',
      );
    }

    const locations = await prisma.location.findMany({
      where: {
        OR: [
          { name: { mode: 'insensitive', contains: query } },
          { street: { mode: 'insensitive', contains: query } },
          { about: { mode: 'insensitive', contains: query } },
          { city: { name: { mode: 'insensitive', contains: query } } },
          { category: { name: { mode: 'insensitive', contains: query } } },
        ],
        published: DEFAULT_PUBLISHED_STATUS,
        deletedAt: null,
      },
      take: Math.min(limit, 50),
      include: locationInclude,
      orderBy: { featured: 'desc' },
    });

    return locations.map((location) => addSimplifiedAnswers(location));
  } catch (error) {
    console.error('Error in searchLocations:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to search locations',
      'SEARCH_ERROR',
    );
  }
};

// New method: Get locations near coordinates
export const getLocationsNearCoordinates = async (
  lat: number,
  lng: number,
  radiusKm: number = 10,
  limit: number = 20,
) => {
  try {
    if (!lat || !lng) {
      throw new LocationServiceError(
        'Latitude and longitude are required',
        'INVALID_COORDINATES',
      );
    }

    // Simple distance calculation using bounding box
    // For more accurate results, consider using PostGIS or similar
    const latDelta = radiusKm / 111; // Approximate km per degree latitude
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const locations = await prisma.location.findMany({
      where: {
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
        published: DEFAULT_PUBLISHED_STATUS,
        deletedAt: null,
      },
      take: Math.min(limit, 50),
      include: locationInclude,
      orderBy: { featured: 'desc' },
    });

    return locations.map((location) => addSimplifiedAnswers(location));
  } catch (error) {
    console.error('Error in getLocationsNearCoordinates:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError(
      'Failed to retrieve nearby locations',
      'NEARBY_ERROR',
    );
  }
};
