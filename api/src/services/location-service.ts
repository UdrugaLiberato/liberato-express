import prisma from '../config/prisma';
import { Express } from 'express';
import {
  locationInclude,
  addSimplifiedAnswers,
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

export const getAllLocations = async (filters: LocationFilters) => {
  const { city, category, name, cursor } = filters;

  const pageSize = 1000;

  const where: any = {
    published: 1,
    deletedAt: null,
  };

  if (city)
    where.city = {
      slug: {
        mode: 'insensitive',
        contains: city,
      },
    };
  if (category)
    where.category = {
      name: {
        mode: 'insensitive',
        contains: category,
      },
    };
  if (name)
    where.name = {
      mode: 'insensitive',
      contains: name,
    };

  if (city !== undefined || category !== undefined || name !== undefined) {
    const locations = await prisma.location.findMany({
      where,
      ...(cursor ? { cursor: { id: cursor } } : undefined),
      take: pageSize + 1,
      include: locationInclude,
      orderBy: { featured: 'desc' },
    });

    const hasNextPage = locations.length > pageSize;
    const nextCursor = hasNextPage ? locations[pageSize - 1].id : null;
    const locationsToReturn = hasNextPage
      ? locations.slice(0, pageSize)
      : locations;

    return {
      locations: locationsToReturn.map((location) =>
        addSimplifiedAnswers(location),
      ),
      nextCursor,
    };
  }

  const locations = await prisma.location.findMany({
    select: {
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
    },
    where: {
      deletedAt: null,
    },
    orderBy: { featured: 'desc' },
  });

  return locations.map((location) => addSimplifiedAnswers(location));
};

export const getLocationById = async (id: string) => {
  const location = await prisma.location.findUnique({
    where: { id },
    include: locationInclude,
  });

  return location ? addSimplifiedAnswers(location) : null;
};

export const getLocationBySlug = async (
  citySlug: string,
  categorySlug: string,
  locationSlug: string,
) => {
  const location = await prisma.location.findFirst({
    where: {
      slug: locationSlug,
      city: { slug: citySlug },
      category: { slug: categorySlug },
      deletedAt: null,
      published: 1,
    },
    include: locationInclude,
  });

  return location ? addSimplifiedAnswers(location) : null;
};

export const getLocationByCityAndCategoryAndName = async (
  filters: LocationFilters,
) => {
  let { city, category, name } = filters;

  name = fromPascalWithDashes(name as string);

  if (city && city.includes('-')) {
    city = city.replaceAll('-', ' ');
  }
  if (category && category.includes('-')) {
    category = category.replaceAll('-', ' ');
  }

  const where: any = {
    city: {
      name: {
        mode: 'insensitive',
        contains: city,
      },
    },
    category: { name: { mode: 'insensitive', contains: category } },
    name: {
      mode: 'insensitive',
      contains: name,
    },
    published: 1,
    deletedAt: null,
  };

  const location = await prisma.location.findFirst({
    where,
    include: locationInclude,
  });

  return location ? addSimplifiedAnswers(location) : null;
};

export const createLocation = async (
  body: LocationCreateData,
  files: Express.Multer.File[],
  userId: string,
) => {
  const city = await prisma.city.findUnique({
    where: { id: body.city_id },
  });

  if (!city) return null;

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
    } catch {
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
      published: 1,
      featured: toInt(body.featured || false),
      createdAt: new Date(),
    },
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
    },
  });

  if (files?.length) {
    await createImages(files, location.id);
  }

  if (body.qa) {
    await createAnswers(body.qa, location.id);
  }

  const fullLocation = await prisma.location.findUnique({
    where: { id: location.id },
    include: locationInclude,
  });

  return fullLocation ? addSimplifiedAnswers(fullLocation) : null;
};

export const updateLocation = async (
  id: string,
  body: LocationUpdateData,
  files: Express.Multer.File[],
) => {
  if (!body) throw new Error('Empty body');

  // Get current location data for slug generation
  const currentLocation = await prisma.location.findUnique({
    where: { id },
    select: { cityId: true, categoryId: true, id: true, name: true },
  });

  if (!currentLocation) throw new Error('Location not found');

  const dataToUpdate = await buildLocationUpdateData(body, currentLocation);

  if (body.street !== undefined || body.city_id !== undefined) {
    const city = body.city_id
      ? await prisma.city.findUnique({ where: { id: body.city_id } })
      : null;

    const coordinates = await getCoordinates(
      `${body.street ?? ''} ${city?.name ?? ''}`,
    );

    dataToUpdate.latitude = coordinates.lat;
    dataToUpdate.longitude = coordinates.lng;
  }

  await prisma.location.update({
    where: { id },
    data: dataToUpdate,
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
    },
  });

  if (files?.length) {
    await prisma.image.deleteMany({ where: { locationId: id } });
    await createImages(files, id);
  }

  if (body.qa) {
    await prisma.answer.deleteMany({ where: { locationId: id } });
    await createAnswers(body.qa, id);
  }

  const fullLocation = await prisma.location.findUnique({
    where: { id },
    include: locationInclude,
  });

  return fullLocation ? addSimplifiedAnswers(fullLocation) : null;
};

export const updateWithImage = async (
  locationId: string,
  uploadResponseData: UploadResponseData,
) => {
  try {
    // Validate input parameters
    if (!locationId) {
      const error = 'Location ID is required';
      console.error('updateWithImage validation failed:', error);
      throw new Error(error);
    }

    if (!uploadResponseData) {
      const error = 'Upload response data is required';
      console.error('updateWithImage validation failed:', error);
      throw new Error(error);
    }

    if (
      !Array.isArray(uploadResponseData.files) ||
      uploadResponseData.files.length === 0
    ) {
      const error = 'No files found in upload response data';
      console.error('updateWithImage validation failed:', error);
      throw new Error(error);
    }

    // Process all files in the upload response
    const imageCreationPromises = uploadResponseData.files
      .filter((file) => file.path) // Only process files with valid paths
      .map((file) => createLocationImage(locationId, file));

    if (imageCreationPromises.length === 0) {
      const error = 'No valid file paths found in upload response';
      console.error('updateWithImage validation failed:', error);
      throw new Error(error);
    }

    await Promise.all(imageCreationPromises);
    console.log(
      `Successfully processed ${imageCreationPromises.length} images for location ${locationId}`,
    );
  } catch (error: any) {
    console.error(
      `Error in updateWithImage for location ${locationId}:`,
      error,
    );
    throw error; // Re-throw to allow caller to handle the error
  }
};

export const deleteLocation = async (id: string) => {
  return prisma.location.update({
    where: { id },
    data: { published: 0, deletedAt: new Date() },
  });
};

export const getLocationsByCityAndCategory = async (
  filters: LocationFilters,
) => {
  let { city, category } = filters;
  const { cursor } = filters;

  if (city && city.includes('-')) {
    city = city.replaceAll('-', ' ');
  }
  if (category && category.includes('-')) {
    category = category.replaceAll('-', ' ');
  }

  const pageSize = 10;

  const locations = await prisma.location.findMany({
    where: {
      city: { name: { mode: 'insensitive', contains: city } },
      category: { name: { mode: 'insensitive', contains: category } },
      published: 1,
      deletedAt: null,
    },
    ...(cursor ? { cursor: { id: cursor } } : undefined),
    take: pageSize + 1,
    include: locationInclude,
    orderBy: { featured: 'desc' },
  });

  const hasNextPage = locations.length > pageSize;
  const nextCursor = hasNextPage ? locations[pageSize - 1].id : null;
  const locationsToReturn = hasNextPage
    ? locations.slice(0, pageSize)
    : locations;

  return {
    locations: locationsToReturn.map((location) =>
      addSimplifiedAnswers(location),
    ),
    nextCursor,
  };
};
