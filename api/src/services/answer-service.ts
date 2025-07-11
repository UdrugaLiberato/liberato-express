import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  return await prisma.answer.findMany({
    where: { deleted_at: null },
    include: {
      location: true,
      question: true,
    },
  });
};

export const getById = async (id: string) => {
  return await prisma.answer.findUnique({
    where: { id },
    include: {
      location: true,
      question: true,
    },
  });
};

export const create = async (data: any) => {
  return await prisma.answer.create({
    data: {
      ...data,
      created_at: new Date(),
    },
  });
};

export const update = async (id: string, data: any) => {
  return await prisma.answer.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });
};

export const remove = async (id: string) => {
  return await prisma.answer.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
};
