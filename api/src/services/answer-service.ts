import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  return prisma.answer.findMany({
    where: { deletedAt: null },
    include: {
      location: true,
      question: true,
    },
  });
};

export const getById = async (id: string) => {
  return prisma.answer.findUnique({
    where: { id },
    include: {
      location: true,
      question: true,
    },
  });
};

export const create = async (data: any) => {
  return prisma.answer.create({
    data: {
      ...data,
      createdAt: new Date(),
    },
  });
};

export const update = async (id: string, data: any) => {
  return prisma.answer.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(),
    },
  });
};

export const remove = async (id: string) => {
  return prisma.answer.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
};
