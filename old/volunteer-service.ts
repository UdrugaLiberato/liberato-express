import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getAll = async () => {
  return await prisma.volunteer.findMany({
    where: {
      deletedAt: null
    }
  });
}

export const getById = async (id: string) => {
  return await prisma.volunteer.findUnique({
    where: { id }
  });
}

export const create = async (data: any) => {
  return await prisma.volunteer.create({
    data: {
      ...data,
      createdAt: new Date()
    }
  });
}

export const update = async (id: string, data: any) => {
  return await prisma.volunteer.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
}

export const remove = async (id: string) => {
  return await prisma.volunteer.update({
    where: { id },
    data: {
      deletedAt: new Date()
    }
  });
}