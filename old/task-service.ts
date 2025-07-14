import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export const getAll = async () => {
  return await prisma.task.findMany({
    include: {
      user_task_created_by_idTouser: true,
      user_task_assigned_to_idTouser: true
    }
  });
}

export const getById = async (id: string) => {
  return await prisma.task.findUnique({
    where: { id },
    include: {
      user_task_created_by_idTouser: true,
      user_task_assigned_to_idTouser: true
    }
  });
}

export const create = async (data: any) => {
  return await prisma.task.create({
    data: {
      ...data,
      createdAt: new Date()
    }
  });
}

export const update = async (id: string, data: any) => {
  return await prisma.task.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
}

// export const deleteTask = async (id: string) => {
//   return await prisma.task.delete({
//     where: { id }
//   });
// }