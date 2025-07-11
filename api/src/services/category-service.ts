import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = () => {
  return prisma.category.findMany({
    include: {
      question: true,
      location: true,
      category_image: true,
    },
  });
};

export const getById = (id: string) => {
  return prisma.category.findUnique({
    where: { id },
    include: {
      question: true,
      location: true,
      category_image: true,
    },
  });
};

export const create = (data: any) => {
  return prisma.category.create({
    data: {
      ...data,
      created_at: new Date(),
    },
  });
};

export const update = (id: string, data: any) => {
  return prisma.category.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

export const remove = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { deleted_at: new Date() },
  });
};
