import prisma from '../config/prisma';

export const getAll = () => {
  return prisma.image.findMany({
    include: {
      category: true,
      location: true,
    },
  });
};

export const getById = (id: number) => {
  return prisma.image.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
    },
  });
};

export const create = (data: any) => {
  return prisma.image.create({ data });
};

export const update = (id: number, data: any) => {
  return prisma.image.update({
    where: { id },
    data,
  });
};

export const remove = (id: number) => {
  return prisma.image.delete({
    where: { id },
  });
};
