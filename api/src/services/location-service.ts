import prisma from '../config/prisma';
import { GoogleMaps } from '../utils/google-maps';

export const getAllLocations = () => {
  return prisma.location.findMany({
    where: { deleted_at: null },
    include: { city: true, category: true, user: true },
  });
};

export const getLocationById = (id: string) => {
  return prisma.location.findUnique({
    where: { id },
    include: { city: true, category: true, user: true },
  });
};

export const createLocation = async (data: {
  categoryId: string;
  cityId: string;
  userId?: string;
  name: string;
  street: string;
  cityName: string;
  phone?: string;
  email?: string;
  about?: string;
  // latitude: number;
  // longitude: number;
  published?: boolean;
  featured?: boolean;
}) => {
  const googleMaps = new GoogleMaps();
  const geo = await googleMaps.getCoordinateForStreet(
    data.street,
    data.cityName,
  );

  if (!geo?.lat || !geo?.lng) {
    throw new Error(
      `Google api error: Latitude or longitude is missing for "${data.street}, ${data.cityName}"`,
    );
  }

  return prisma.location.create({
    data: {
      category: {
        connect: { id: data.categoryId },
      },
      // category_id: data.categoryId,
      city: {
        connect: { id: data.cityId },
      },
      user: data.userId ? { connect: { id: data.userId } } : undefined,
      // city_id: data.cityId,
      // user_id: data.userId,
      name: data.name,
      street: data.street,
      phone: data.phone,
      email: data.email,
      about: data.about,
      latitude: geo.lat,
      longitude: geo.lng,
      published: data.published ?? false,
      featured: data.featured ?? false,
      created_at: new Date(),
    },
  });
};

export const updateLocation = async (
  id: string,
  data: Partial<{
    name: string;
    street: string;
    phone?: string;
    email?: string;
    about?: string;
    latitude: number;
    longitude: number;
    published: boolean;
    featured: boolean;
  }>,
) => {
  return prisma.location.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

export const deleteLocation = async (id: string) => {
  return prisma.location.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
};
