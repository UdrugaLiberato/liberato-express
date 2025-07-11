import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  return await prisma.question.findMany({
    where: { deleted_at: null },
    include: {
      answer: true,
      category: true,
    },
  });
};

export const getById = async (id: string) => {
  return await prisma.question.findUnique({
    where: { id },
    include: {
      answer: true,
      category: true,
    },
  });
};

export const create = async (data: any) => {
  return await prisma.question.create({
    data: {
      ...data,
      created_at: new Date(),
    },
  });
};

export const update = async (id: string, data: any) => {
  return await prisma.question.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

export const remove = async (id: string) => {
  return await prisma.question.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
};
