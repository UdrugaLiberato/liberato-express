import prisma from '../config/prisma';
import { CityData, CityUpdateData } from '../types';
import env from '../config/env';

export const generateSlug = (name: string): string => {
  const croatianCharMap: { [key: string]: string } = {
    š: 's',
    đ: 'd',
    č: 'c',
    ć: 'c',
    ž: 'z',
    Š: 's',
    Đ: 'd',
    Č: 'c',
    Ć: 'c',
    Ž: 'z',
  };

  return [...name]
    .map((char) => croatianCharMap[char] || char)
    .join('')
    .toLowerCase()
    .replaceAll(/\s+/g, '-')
    .replaceAll(/[^\da-z-]/g, '')
    .replaceAll(/-+/g, '-')
    .replaceAll(/(^-)|(-$)/g, '');
};

export const buildCityData = (data: CityData) => ({
  name: data.name,
  slug: generateSlug(data.name),
  descriptionEN: data.descriptionEN,
  descriptionHR: data.descriptionHR,
  latitude: data.latitude,
  longitude: data.longitude,
  radiusInKm: data.radiusInKm ?? 1,
  createdAt: new Date(),
});

export const buildCityUpdateData = (data: CityUpdateData) => ({
  ...data,
  ...(data.name && { slug: generateSlug(data.name) }),
  updatedAt: new Date(),
});

export const validateCityDeletion = async (id: string) => {
  const city = await prisma.city.findUnique({
    where: { id },
    include: { location: true },
  });

  if (!city) {
    throw new Error('City not found');
  }

  if (city.location.length > 0) {
    throw new Error('City has linked locations and cannot be deleted');
  }

  return city;
};

export const createCityImage = async (
  cityId: string,
  image: {
    path: string;
    name?: string;
    size?: number;
    fileType?: string;
  },
) => {
  return prisma.image.create({
    data: {
      src: `${env.STORE_URL}${image.path}`,
      name: image.name || 'city-image',
      mime: image.fileType || 'application/octet-stream',
      cityId,
    },
  });
};
