import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getByImageId = async (image_id: number) => {
  return await prisma.image_location.findMany({
    where: { image_id },
    include: { location: true }
  });
}

export const create = async (data: { image_id: number; location_id: string }) => {
  return await prisma.image_location.create({ data });
}

export const remove = async (image_id: number, location_id: string) => {
  return await prisma.image_location.delete({
    where: {
      image_id_location_id: {
        image_id,
        location_id
      }
    }
  });
}