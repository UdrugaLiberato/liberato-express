import prisma from '../config/prisma';
import { CityData, CityUpdateData } from '../types';

export const buildCityData = (data: CityData) => ({
  name: data.name,
  descriptionEN: data.descriptionEN,
  descriptionHR: data.descriptionHR,
  latitude: data.latitude,
  longitude: data.longitude,
  radiusInKm: data.radiusInKm ?? 1,
  createdAt: new Date(),
});

export const buildCityUpdateData = (data: CityUpdateData) => ({
  ...data,
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
