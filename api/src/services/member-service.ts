import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async () => {
  return await prisma.member.findMany();
};

export const getById = async (id: string) => {
  return await prisma.member.findUnique({
    where: { id },
  });
};

export const create = async (data: any) => {
  return await prisma.member.create({
    data,
  });
};

export const update = async (id: string, data: any) => {
  return await prisma.member.update({
    where: { id },
    data,
  });
};

export const remove = async (id: string) => {
  return await prisma.member.delete({
    where: { id },
  });
};
