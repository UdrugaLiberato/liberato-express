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
  files: Express.Multer.File[],
  userId: any,
) => {


  const googleMaps = new GoogleMaps();
  // @todo viktor - cityname should get from city id
  const geo = await googleMaps.getCoordinateForStreet(body.street, "Split");

  if (!geo?.lat || !geo?.lng) {
    throw new Error(`Google Maps failed to find coordinates`);
  }

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
      user: { connect: { id: userId } },
      name: body.name,
      street: body.street,
      phone: body.phone,
      email: body.email,
      about: body.about,
      latitude: geo.lat,
      longitude: geo.lng,
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

export const addLocationImage = async () => {

}

export const removeLocationImage = async () => {

}


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
