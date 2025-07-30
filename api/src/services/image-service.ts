import prisma from '../config/prisma';
import {
  imageInclude,
  buildImageData,
  buildImageUpdateData,
} from '../utils/image-utils';

export const getAll = () => {
  return prisma.image.findMany({
    include: imageInclude,
  });
};

export const getById = (id: number) => {
  return prisma.image.findUnique({
    where: { id },
    include: imageInclude,
  });
};

export const create = (data: any) => {
  return prisma.image.create({
    data: buildImageData(data),
  });
};

export const update = (id: number, data: any) => {
  return prisma.image.update({
    where: { id },
    data: buildImageUpdateData(data),
  });
};

export const remove = (id: number) => {
  return prisma.image.delete({
    where: { id },
  });
};
