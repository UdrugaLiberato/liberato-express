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

  const city = await prisma.city.findUnique({
    where: { id: body.city_id },
  });

  if (!city) {
    return null;
  }

  const geo = await googleMaps.getCoordinateForStreet(body.street, city.name);

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

export const updateLocation = async (
  id: string,
  body: Partial<{
    name: string;
    street: string;
    phone?: string;
    email?: string;
    about?: string;
    category_id: string;
    city_id: string;
    published: boolean | string;
    featured: boolean | string;
  }>
) => {
  const dataToUpdate: any = {};

  if (body.name !== undefined) dataToUpdate.name = body.name;
  if (body.street !== undefined) dataToUpdate.street = body.street;
  if (body.phone !== undefined) dataToUpdate.phone = body.phone;
  if (body.email !== undefined) dataToUpdate.email = body.email;
  if (body.about !== undefined) dataToUpdate.about = body.about;

  if (body.category_id !== undefined) {
    dataToUpdate.category = { connect: { id: body.category_id } };
  }

  if (body.city_id !== undefined) {
    dataToUpdate.city = { connect: { id: body.city_id } };
  }

  if (body.published !== undefined) {
    dataToUpdate.published = body.published === true || body.published === 'true';
  }

  if (body.featured !== undefined) {
    dataToUpdate.featured = body.featured === true || body.featured === 'true';
  }

  if (body.street !== undefined || body.city_id !== undefined) {
    // Get city name if city_id is provided (you said this was a @todo)
    const city = body.city_id
      ? await prisma.city.findUnique({ where: { id: body.city_id } })
      : null;

    const googleMaps = new GoogleMaps();
    const geo = await googleMaps.getCoordinateForStreet(body.street ?? '', city?.name ?? 'Split');

    if (!geo?.lat || !geo?.lng) {
      throw new Error(`Google Maps failed to find coordinates`);
    }

    dataToUpdate.latitude = geo.lat;
    dataToUpdate.longitude = geo.lng;
  }

  dataToUpdate.updated_at = new Date();

  return prisma.location.update({
    where: { id },
    data: dataToUpdate,
    include: {
      city: true,
      category: true,
      user: { select: { id: true, username: true } },
      image_location: {
        include: { image: true },
      },
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


export const addLocationImage = async (
  locationId: string,
  files: Express.Multer.File[]
) => {
  // Create image entries
  const imageCreates = await Promise.all(
    files.map((file) =>
      prisma.image.create({
        data: {
          src: file.filename,
          name: file.originalname,
          mime: file.mimetype || null,
        },
      })
    )
  );

  // Link them to the location via image_location table
  const imageLocationLinks = imageCreates.map((img) => ({
    image_id: img.id,
    location_id: locationId,
  }));

  await prisma.image_location.createMany({
    data: imageLocationLinks,
  });

  // Return updated location with images
  return prisma.location.findUnique({
    where: { id: locationId },
    include: {
      image_location: {
        include: { image: true },
      },
    },
  });
};


export const removeLocationImage = async (
  imageId: number,
  locationId: string
) => {
  // Remove the link
  await prisma.image_location.delete({
    where: {
      image_id_location_id: {
        image_id: imageId,
        location_id: locationId,
      },
    },
  });

  // Check if the image is still linked elsewhere
  const stillUsed = await prisma.image_location.findFirst({
    where: { image_id: imageId },
  });

  // If not used, delete the image record itself
  if (!stillUsed) {
    await prisma.image.delete({ where: { id: imageId } });
  }

  return { success: true };
};