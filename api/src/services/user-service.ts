import prisma from '../config/prisma';
import {
  userInclude,
  userWithLocationInclude,
  buildUserData,
  buildUserUpdateData,
} from '../utils/user-utils';

export const getAll = () => {
  return prisma.user.findMany({
    include: userInclude,
  });
};

export const getById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    include: userWithLocationInclude,
  });
};

export const create = async (data: any) => {
  return prisma.user.create({
    data: await buildUserData(data),
  });
};

export const createIncomplete = async (
  email: string,
  password: string,
  username: string,
  avatar: string,
) => {
  return prisma.user.create({
    data: await buildUserData({
      emailAddress: email,
      username,
      password,
      avatarUrl: avatar,
    }),
  });
};

export const update = async (id: string, data: any) => {
  return prisma.user.update({
    where: { id },
    data: await buildUserUpdateData(data),
  });
};

export const remove = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { location: true },
  });
  if (!user) throw new Error('User not found');

  if (user.deletedAt) throw new Error('User already deactivated');

  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};
