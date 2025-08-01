import prisma from '../config/prisma';
import {
  buildCityData,
  buildCityUpdateData,
  validateCityDeletion,
} from '../utils/city-utils';
import { CityData, CityUpdateData, CityFilters } from '../types';

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

export const getCityByName = async (filters: CityFilters) => {
  let { name } = filters;
  if (name && name.includes('-')) {
    name = name.replaceAll('-', ' ');
  }

  if (!name) return null;

  const exactMatch = await prisma.city.findFirst({
    where: {
      name: {
        mode: 'insensitive',
        equals: name,
      },
    },
  });

  if (exactMatch) return exactMatch;

  return prisma.city.findFirst({
    where: {
      name: {
        mode: 'insensitive',
        contains: name,
      },
    },
  });
};

export const createCity = async (data: CityData) => {
  return prisma.city.create({
    data: buildCityData(data),
  });
};

export const updateCity = async (id: string, data: CityUpdateData) => {
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
