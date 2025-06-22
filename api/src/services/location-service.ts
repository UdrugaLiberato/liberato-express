import prisma from '../config/prisma';
import { GoogleMaps } from '../utils/google-maps';
import { Express } from 'express';

export const getAllLocations = () => {
  return prisma.location.findMany({
    where: { deleted_at: null },
    include: { city: true, category: true, user: { select: {id: true, username: true }} },
  });
};

export const getLocationById = (id: string) => {
  return prisma.location.findUnique({
    where: { id },
    include: { city: true, category: true, user: { select: {id: true, username: true }} },
  });
};


export const createLocation = async (
  body: any,
  files: Express.Multer.File[]
) => {
  const imageCreates = await Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: file.filename,
          name: file.originalname,
          mime: file.mimetype,
        },
      })
    )
  );

  const imageLocationLinks = imageCreates.map((img) => ({
    image: { connect: { id: img.id } },
  }));

  const location = await prisma.location.create({
    data: {
      category: { connect: { id: body.category_id } },
      city: { connect: { id: body.city_id } },
      user: body.user_id ? { connect: { id: body.user_id } } : undefined,
      name: body.name,
      street: body.street,
      phone: body.phone,
      email: body.email,
      about: body.about,
      latitude: parseFloat(body.latitude),
      longitude: parseFloat(body.longitude),
      published: body.published === 'true',
      featured: body.featured === 'true',
      created_at: new Date(),
      image_location: {
        create: imageLocationLinks,
      },
    },
    include: {
      city: true,
      category: true,
      user: {
        select: { id: true, username: true },
      },
      image_location: {
        include: { image: true },
      },
    },
  });

  return location;
};


export const createLocationOld = async (data: {
  categoryId: string;
  cityId: string;
  userId?: string;
  name: string;
  street: string;
  cityName: string,
  phone?: string;
  email?: string;
  about?: string;
  // latitude: number;
  // longitude: number;
  published?: boolean;
  featured?: boolean;
}) => {
  const googleMaps = new GoogleMaps();
  const geo = await googleMaps.getCoordinateForStreet(data.street, data.cityName);

  if (!geo?.lat || !geo?.lng) {
    throw new Error(`Google api error: Latitude or longitude is missing for "${data.street}, ${data.cityName}"`);
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
