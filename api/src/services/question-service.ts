import prisma from '../config/prisma';

export const getAll = () => {
  return prisma.question.findMany({
    where: { deletedAt: null },
    include: {
      answer: true,
      category: true,
    },
  });
};

export const getById = (id: string) => {
  return prisma.question.findUnique({
    where: { id },
    include: {
      answer: true,
      category: true,
    },
  });
};

export const create = (data: any) => {
  return prisma.question.create({
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
};

export const update = (id: string, data: any) => {
  return prisma.question.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

export const remove = (id: string) => {
  return prisma.question.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
