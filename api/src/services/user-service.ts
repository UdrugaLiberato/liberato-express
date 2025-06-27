import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const getAll = () => {
  return prisma.user.findMany({
    include: {
      location: true,
    }
  })
}

export const getById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      location: {
        include: {
          image_location: {
            include: {
              image: true,
            }
          }
        }
      }
    }
  })
}

export const create = async (data: any) => {
  const hashedPassword = data.password? await bcrypt.hash(data.password, 10) : '';
  return prisma.user.create({
    data: {
      ...data,
      roles: data.roles || 'ROLE_USER',
      password: hashedPassword,
      created_at: new Date()
    }
  })
}

export const createIncomplete = async (
  email: string,
  password: string,
  username: string,
  avatar: string,
) => {
  const hashedPassword = password? await bcrypt.hash(password, 10) : '';
  return prisma.user.create({
    data: {
      email: email,
      username: username,
      roles: JSON.stringify(['ROLE_USER']),
      password: hashedPassword,
      created_at: new Date(),
      avatar: avatar
    }
  })
}

export const update = async (id: string, data: any) => {
  const updateData = {
    ...data,
    updated_at: new Date()
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  return prisma.user.update({
    where: { id },
    data: updateData
  })
}

export const remove = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, include: { location: true } })
  if (!user) throw new Error('User not found')

  if (user.deleted_at) throw new Error('User already deactivated')

  return prisma.user.update({
    where: { id },
    data: { deleted_at: new Date() }
  })
}