import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getAll = async () => {
  return await prisma.image.findMany({
    include: {
      category: true,
      location: true
    }
  });
}

export const getById = async (id: number) => {
  return await prisma.image.findUnique({
    where: { id },
    include: {
      category: true,
      location: true
    }
  });
}

export const create = async (data: any) => {
  return await prisma.image.create({ data });
}

export const update = async (id: number, data: any) => {
  return await prisma.image.update({
    where: { id },
    data
  });
}

export const remove = async (id: number) => {
  return await prisma.image.delete({
    where: { id }
  });
}