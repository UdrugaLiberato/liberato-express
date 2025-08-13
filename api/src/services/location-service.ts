import prisma from '../config/prisma';
import {
  LocationData,
  LocationCreateData,
  LocationUpdateData,
  LocationFilters,
  LocationResponse,
  SimplifiedAnswer,
  LocationWithSimplifiedAnswers,
} from '../types';
import {
  locationInclude,
  simplifyAnswers,
  addSimplifiedAnswers,
  getCoordinates,
  createLocationImage,
  createImages,
  createAnswers,
  buildLocationUpdateData,
  validateLocationData,
  calculateDistance,
  formatLocationForDisplay,
} from '../utils/location-utils';

// Constants for better maintainability
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_PUBLISHED_STATUS = 1; // Changed to number for Prisma compatibility

// Custom error class for location service
class LocationServiceError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'LocationServiceError';
  }
}

// Helper function to build location where clause
const buildLocationWhereClause = (filters: LocationFilters) => {
  const where: any = {
    deletedAt: null,
  };

  if (filters.city) {
    where.cityId = filters.city;
  }

  if (filters.category) {
    where.categoryId = filters.category;
  }

  if (filters.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }

  if (filters.featured !== undefined) {
    where.featured = filters.featured ? 1 : 0; // Convert boolean to number
  }

  return where;
};

// Helper function to handle pagination
const handlePagination = (filters: LocationFilters) => {
  const limit = Math.min(
    filters.limit || DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
  );

  const pagination: any = {
    take: limit,
  };

  if (filters.cursor) {
    pagination.cursor = { id: filters.cursor };
    pagination.skip = 1;
  }

  return pagination;
};

export const getAllLocations = async (
  filters: LocationFilters = {},
): Promise<LocationWithSimplifiedAnswers[]> => {
  try {
    // Validate filters
    if (filters.limit && (filters.limit < 1 || filters.limit > MAX_PAGE_SIZE)) {
      throw new LocationServiceError(
        `Limit must be between 1 and ${MAX_PAGE_SIZE}`,
        'INVALID_LIMIT',
      );
    }

    const where = buildLocationWhereClause(filters);
    const pagination = handlePagination(filters);

    const locations = await prisma.location.findMany({
      where,
      include: locationInclude,
      orderBy: { createdAt: 'desc' },
      ...pagination,
    });

    return locations.map(addSimplifiedAnswers);
  } catch (error) {
    console.error('Error in getAllLocations:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get locations', 'DATABASE_ERROR');
  }
};

export const getLocationById = async (id: string): Promise<LocationWithSimplifiedAnswers | null> => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'MISSING_ID');
    }

    const location = await prisma.location.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: locationInclude,
    });

    return location ? addSimplifiedAnswers(location) : null;
  } catch (error) {
    console.error('Error in getLocationById:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get location by ID', 'DATABASE_ERROR');
  }
};

export const getLocationBySlug = async (slug: string): Promise<LocationWithSimplifiedAnswers | null> => {
  try {
    if (!slug) {
      throw new LocationServiceError('Location slug is required', 'MISSING_SLUG');
    }

    const location = await prisma.location.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: locationInclude,
    });

    return location ? addSimplifiedAnswers(location) : null;
  } catch (error) {
    console.error('Error in getLocationBySlug:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get location by slug', 'DATABASE_ERROR');
  }
};

export const getLocationByCityAndCategoryAndName = async (
  cityId: string,
  categoryId: string,
  name: string,
): Promise<LocationWithSimplifiedAnswers | null> => {
  try {
    if (!cityId || !categoryId || !name) {
      throw new LocationServiceError('City ID, category ID, and name are required', 'MISSING_PARAMS');
    }

    const location = await prisma.location.findFirst({
      where: {
        cityId,
        categoryId,
        name,
        deletedAt: null,
      },
      include: locationInclude,
    });

    return location ? addSimplifiedAnswers(location) : null;
  } catch (error) {
    console.error('Error in getLocationByCityAndCategoryAndName:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get location by city, category, and name', 'DATABASE_ERROR');
  }
};

export const createLocation = async (
  locationData: LocationCreateData,
  files?: Express.Multer.File[],
): Promise<LocationWithSimplifiedAnswers> => {
  try {
    // Validate input data
    const validation = validateLocationData(locationData);
    if (!validation.isValid) {
      throw new LocationServiceError(
        `Validation failed: ${validation.errors.join(', ')}`,
        'VALIDATION_ERROR',
      );
    }

    // Get coordinates if not provided
    let coordinates = { latitude: 0, longitude: 0 };
    if (!locationData.latitude || !locationData.longitude) {
      try {
        const coords = await getCoordinates(locationData.street);
        coordinates = {
          latitude: coords.lat,
          longitude: coords.lng,
        };
      } catch (error) {
        console.warn('Failed to get coordinates, using defaults:', error);
      }
    } else {
      coordinates = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      };
    }

    // Create location with images and answers concurrently
    const [location, images, answers] = await Promise.all([
      prisma.location.create({
        data: {
          name: locationData.name,
          street: locationData.street,
          phone: locationData.phone,
          email: locationData.email,
          about: locationData.about,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          published: DEFAULT_PUBLISHED_STATUS,
          featured: locationData.featured ? 1 : 0,
          category: { connect: { id: locationData.category_id } },
          city: { connect: { id: locationData.city_id } },
          createdAt: new Date(),
        },
        include: locationInclude,
      }),
      files && files.length > 0 ? createImages(files, '') : Promise.resolve([]),
      locationData.qa ? createAnswers(locationData.qa, '') : Promise.resolve([]),
    ]);

    // Update images and answers with the actual location ID
    if (images.length > 0) {
      await Promise.all(
        images.map(image =>
          prisma.image.update({
            where: { id: image.id },
            data: { locationId: location.id },
          }),
        ),
      );
    }

    if (answers.length > 0) {
      await Promise.all(
        answers.map(answer =>
          prisma.answer.update({
            where: { id: answer.id },
            data: { locationId: location.id },
          }),
        ),
      );
    }

    return addSimplifiedAnswers(location);
  } catch (error) {
    console.error('Error in createLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to create location', 'DATABASE_ERROR');
  }
};

export const updateLocation = async (
  id: string,
  updateData: LocationUpdateData,
  files?: Express.Multer.File[],
): Promise<LocationWithSimplifiedAnswers> => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'MISSING_ID');
    }

    // Get current location
    const currentLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!currentLocation) {
      throw new LocationServiceError('Location not found', 'LOCATION_NOT_FOUND');
    }

    // Build update data
    const data = await buildLocationUpdateData(updateData, currentLocation);

    // Update location with images and answers concurrently
    const [updatedLocation, images, answers] = await Promise.all([
      prisma.location.update({
        where: { id },
        data,
        include: locationInclude,
      }),
      files && files.length > 0 ? createImages(files, id) : Promise.resolve([]),
      updateData.qa ? createAnswers(updateData.qa, id) : Promise.resolve([]),
    ]);

    return addSimplifiedAnswers(updatedLocation);
  } catch (error) {
    console.error('Error in updateLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to update location', 'DATABASE_ERROR');
  }
};

export const updateWithImage = async (
  id: string,
  image: Express.Multer.File,
): Promise<LocationWithSimplifiedAnswers> => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'MISSING_ID');
    }

    if (!image) {
      throw new LocationServiceError('Image is required', 'MISSING_IMAGE');
    }

    const locationImage = await createLocationImage(id, {
      path: image.path,
      name: image.originalname,
      size: image.size,
      fileType: image.mimetype,
    });

    const location = await prisma.location.findUnique({
      where: { id },
      include: locationInclude,
    });

    if (!location) {
      throw new LocationServiceError('Location not found', 'LOCATION_NOT_FOUND');
    }

    return addSimplifiedAnswers(location);
  } catch (error) {
    console.error('Error in updateWithImage:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to update location with image', 'DATABASE_ERROR');
  }
};

export const deleteLocation = async (id: string): Promise<void> => {
  try {
    if (!id) {
      throw new LocationServiceError('Location ID is required', 'MISSING_ID');
    }

    await prisma.location.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  } catch (error) {
    console.error('Error in deleteLocation:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to delete location', 'DATABASE_ERROR');
  }
};

export const getLocationsByCityAndCategory = async (
  cityId: string,
  categoryId: string,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<LocationWithSimplifiedAnswers[]> => {
  try {
    if (!cityId || !categoryId) {
      throw new LocationServiceError('City ID and category ID are required', 'MISSING_PARAMS');
    }

    const locations = await prisma.location.findMany({
      where: {
        cityId,
        categoryId,
        deletedAt: null,
      },
      include: locationInclude,
      take: Math.min(limit, MAX_PAGE_SIZE),
      orderBy: { createdAt: 'desc' },
    });

    return locations.map(addSimplifiedAnswers);
  } catch (error) {
    console.error('Error in getLocationsByCityAndCategory:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get locations by city and category', 'DATABASE_ERROR');
  }
};

// New public methods for enhanced functionality

export const getFeaturedLocations = async (
  limit: number = 10,
): Promise<LocationWithSimplifiedAnswers[]> => {
  try {
    const locations = await prisma.location.findMany({
      where: {
        featured: 1, // Use number instead of boolean
        published: 1, // Use number instead of boolean
        deletedAt: null,
      },
      include: locationInclude,
      take: Math.min(limit, MAX_PAGE_SIZE),
      orderBy: { createdAt: 'desc' },
    });

    return locations.map(addSimplifiedAnswers);
  } catch (error) {
    console.error('Error in getFeaturedLocations:', error);
    throw new LocationServiceError('Failed to get featured locations', 'DATABASE_ERROR');
  }
};

export const searchLocations = async (
  query: string,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<LocationWithSimplifiedAnswers[]> => {
  try {
    if (!query || typeof query !== 'string') {
      throw new LocationServiceError('Search query is required', 'MISSING_QUERY');
    }

    const locations = await prisma.location.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { street: { contains: query, mode: 'insensitive' } },
          { about: { contains: query, mode: 'insensitive' } },
          { city: { name: { contains: query, mode: 'insensitive' } } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
        deletedAt: null,
      },
      include: locationInclude,
      take: Math.min(limit, MAX_PAGE_SIZE),
      orderBy: { createdAt: 'desc' },
    });

    return locations.map(addSimplifiedAnswers);
  } catch (error) {
    console.error('Error in searchLocations:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to search locations', 'DATABASE_ERROR');
  }
};

export const getLocationsNearCoordinates = async (
  latitude: number,
  longitude: number,
  radiusKm: number = 10,
  limit: number = DEFAULT_PAGE_SIZE,
): Promise<LocationWithSimplifiedAnswers[]> => {
  try {
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      throw new LocationServiceError('Valid coordinates are required', 'INVALID_COORDINATES');
    }

    // Calculate bounding box for efficient querying
    const latDelta = radiusKm / 111.32; // Approximate km per degree latitude
    const lngDelta = radiusKm / (111.32 * Math.cos(latitude * Math.PI / 180));

    const locations = await prisma.location.findMany({
      where: {
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lngDelta,
          lte: longitude + lngDelta,
        },
        deletedAt: null,
      },
      include: locationInclude,
      take: Math.min(limit, MAX_PAGE_SIZE),
      orderBy: { createdAt: 'desc' },
    });

    // Filter by actual distance and sort by proximity
    const locationsWithDistance = locations
      .map(location => ({
        ...location,
        distance: calculateDistance(latitude, longitude, location.latitude, location.longitude),
      }))
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return locationsWithDistance.map(location => {
      const { distance, ...locationWithoutDistance } = location;
      return addSimplifiedAnswers(locationWithoutDistance);
    });
  } catch (error) {
    console.error('Error in getLocationsNearCoordinates:', error);
    if (error instanceof LocationServiceError) {
      throw error;
    }
    throw new LocationServiceError('Failed to get locations near coordinates', 'DATABASE_ERROR');
  }
};
