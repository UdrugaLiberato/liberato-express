import prisma from '../config/prisma';
import {
  buildCityData,
  buildCityUpdateData,
  validateCityDeletion,
  createCityImage,
} from '../utils/city-utils';
import {
  CityData,
  CityUpdateData,
  CityFilters,
  UploadResponseData,
} from '../types';

export const getAllCities = () => {
  return prisma.city.findMany({
    where: { deletedAt: null },
    include: {
      images: true,
    },
  });
};

export const getCityById = (id: string) => {
  return prisma.city.findUnique({
    where: { id },
    include: {
      images: true,
    },
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
    include: {
      images: true,
    },
  });
};

export const createCity = async (data: CityData) => {
  return prisma.city.create({
    data: await buildCityData(data),
  });
};

export const updateCity = async (id: string, data: CityUpdateData) => {
  return prisma.city.update({
    where: { id },
    data: await buildCityUpdateData(data, id),
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

export const updateWithImage = async (
  cityId: string,
  uploadResponseData: UploadResponseData,
) => {
  if (
    uploadResponseData &&
    Array.isArray(uploadResponseData.files) &&
    uploadResponseData.files.length > 0 &&
    uploadResponseData.files[0].path
  ) {
    await createCityImage(cityId, uploadResponseData.files[0]);
  }
};
