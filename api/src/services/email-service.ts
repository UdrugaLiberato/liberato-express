import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  return await prisma.emails.findMany();
};

export const getById = async (id: string) => {
  return await prisma.emails.findUnique({
    where: { id },
  });
};

export const create = async (data: any) => {
  return await prisma.emails.create({
    data,
  });
};

export const update = async (id: string, data: any) => {
  return await prisma.emails.update({
    where: { id },
    data,
  });
};

export const remove = async (id: string) => {
  return await prisma.emails.delete({
    where: { id },
  });
};
