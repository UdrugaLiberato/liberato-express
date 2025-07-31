import prisma from '../config/prisma';
import { Express } from 'express';
import {
  locationInclude,
  addSimplifiedAnswers,
  getCoordinates,
  createImages,
  createAnswers,
  buildLocationUpdateData,
  toInt,
} from '../utils/location-utils';
import {
  LocationFilters,
  LocationCreateData,
  LocationUpdateData,
} from '../types';

export const getAllLocations = async (filters: LocationFilters) => {
  const { city, category } = filters;

  const where: any = {};

  if (city) where.city = { name: city };
  if (category) where.category = { name: category };
  where.published = 1;
  where.deletedAt = null;

  const locations = await prisma.location.findMany({
    where,
    include: locationInclude,
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

export const getLocationByCityAndCategoryAndName = async (
  city: string,
  category: string,
  name: string,
) => {
  const where: any = {
    city: { name: city },
    category: { name: category },
    name,
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

  const location = await prisma.location.create({
    data: {
      category: { connect: { id: body.category_id } },
      city: { connect: { id: body.city_id } },
      user: { connect: { id: userId } },
      name: body.name,
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

  const dataToUpdate = buildLocationUpdateData(body);

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

export const deleteLocation = async (id: string) => {
  return prisma.location.update({
    where: { id },
    data: { published: 0, deletedAt: new Date() },
  });
};

export const getLocationsByCityAndCategory = async (
  city: string,
  category: string,
  cursor?: string,
) => {
  const pageSize = 10;

  const locations = await prisma.location.findMany({
    where: {
      city: { name: city },
      category: { name: category },
      deletedAt: null,
    },
    ...(cursor ? { cursor: { id: cursor } } : undefined),
    take: pageSize + 1,
    include: locationInclude,
    orderBy: { createdAt: 'desc' },
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
