import prisma from '../config/prisma';
import {
  imageInclude,
  buildImageData,
  buildImageUpdateData,
} from '../utils/image-utils';
import { ImageData, ImageUpdateData } from '../types';

export const getAll = () => {
  return prisma.image.findMany({
    where: {
      deletedAt: null,
    },
    include: imageInclude,
  });
};

export const getById = (id: number) => {
  return prisma.image.findUnique({
    where: { id },
    include: imageInclude,
  });
};

export const create = (data: ImageData) => {
  return prisma.image.create({
    data: buildImageData(data),
  });
};

export const update = (id: number, data: ImageUpdateData) => {
  return prisma.image.update({
    where: { id },
    data: buildImageUpdateData(data),
  });
};

export const remove = (id: number) => {
  return prisma.image.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
