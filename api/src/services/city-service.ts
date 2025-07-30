import prisma from '../config/prisma';
import {
  buildCityData,
  buildCityUpdateData,
  validateCityDeletion,
} from '../utils/city-utils';

export const getAllCities = () => {
  return prisma.city.findMany({
    where: { deletedAt: null },
  });
};

export const getCityById = (id: string) => {
  return prisma.city.findUnique({
    where: { id },
  });
};

export const getCityByName = (name: string) => {
  return prisma.city.findUnique({
    where: { name },
  });
};

export const createCity = async (data: {
  name: string;
  latitude: number;
  longitude: number;
  radiusInKm?: number | null;
}) => {
  return prisma.city.create({
    data: buildCityData(data),
  });
};

export const updateCity = async (
  id: string,
  data: Partial<{
    name: string;
    latitude: number;
    longitude: number;
    radiusInKm: number;
  }>,
) => {
  return prisma.city.update({
    where: { id },
    data: buildCityUpdateData(data),
  });
};

export const deleteCity = async (id: string) => {
  await validateCityDeletion(id);

  return prisma.city.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
