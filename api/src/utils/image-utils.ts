import prisma from '../config/prisma';
import { ImageData } from '../types';

export const createImage = async (data: ImageData) => {
  return prisma.image.create({
    data: {
      src: data.src,
      name: data.name,
      mime: data.mime,
      categoryId: data.category_id,
      locationId: data.location_id,
      cityId: data.city_id,
    },
  });
};

export const updateImage = async (id: number, data: Partial<ImageData>) => {
  return prisma.image.update({
    where: { id },
    data: {
      src: data.src,
      name: data.name,
      mime: data.mime,
      categoryId: data.category_id,
      locationId: data.location_id,
      cityId: data.city_id,
    },
  });
};

export const deleteImage = async (id: number) => {
  return prisma.image.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};

export const getImageById = async (id: number) => {
  return prisma.image.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
      city: true,
    },
  });
};

export const getImagesByCategory = async (categoryId: string) => {
  return prisma.image.findMany({
    where: {
      categoryId,
      deletedAt: null,
    },
  });
};

export const getImagesByLocation = async (locationId: string) => {
  return prisma.image.findMany({
    where: {
      locationId,
      deletedAt: null,
    },
  });
};

export const getImagesByCity = async (cityId: string) => {
  return prisma.image.findMany({
    where: {
      cityId,
      deletedAt: null,
    },
  });
};

// Legacy exports for backward compatibility
export const imageInclude = {
  category: true,
  location: true,
};

export const buildImageData = (data: ImageData) => ({
  src: data.src,
  name: data.name,
  mime: data.mime,
  categoryId: data.category_id,
  locationId: data.location_id,
  cityId: data.city_id,
  createdAt: new Date(),
});

export const buildImageUpdateData = (data: Partial<ImageData>) => ({
  ...data,
  updatedAt: new Date(),
});

export const parseImageId = (id: string): number => {
  return parseInt(id, 10);
};
