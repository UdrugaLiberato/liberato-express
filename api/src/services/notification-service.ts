import prisma from '../config/prisma';
import {
  NotificationData,
  NotificationUpdateData,
  NotificationFilters,
} from '../types';
import { NotificationPlatform } from '@prisma/client';

export const createNotification = async (data: NotificationData) => {
  const notification = await prisma.notification.create({
    data: {
      deviceToken: data.deviceToken,
      platform: data.platform as NotificationPlatform,
      isActive: data.isActive ?? true,
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
  });
  return notification;
};

export const getNotificationByToken = async (deviceToken: string) => {
  const notification = await prisma.notification.findUnique({
    where: {
      deviceToken,
      deletedAt: null,
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
  });
  return notification;
};

export const getAllNotifications = async (
  filters?: NotificationFilters & { active?: 'true' | 'false' | 'all' },
) => {
  const where: any = {
    deletedAt: null,
  };

  // Handle active filter: default is 'true'
  const activeFilter = filters?.active ?? 'true';
  if (activeFilter === 'true') {
    where.isActive = true;
  } else if (activeFilter === 'false') {
    where.isActive = false;
  }
  // If activeFilter === 'all', don't add isActive filter

  if (filters?.platform) {
    where.platform = filters.platform;
  }

  const notifications = await prisma.notification.findMany({
    where,
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return notifications;
};

export const updateNotification = async (
  deviceToken: string,
  data: NotificationUpdateData,
) => {
  const notification = await prisma.notification.update({
    where: {
      deviceToken,
    },
    data: {
      ...data,
      updatedAt: new Date(),
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
  });
  return notification;
};

export const deleteNotification = async (deviceToken: string) => {
  const notification = await prisma.notification.update({
    where: {
      deviceToken,
    },
    data: {
      deletedAt: new Date(),
    },
  });
  return notification;
};

export const deactivateNotification = async (deviceToken: string) => {
  const notification = await prisma.notification.update({
    where: {
      deviceToken,
    },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
  });
  return notification;
};

export const reactivateNotification = async (deviceToken: string) => {
  const notification = await prisma.notification.update({
    where: {
      deviceToken,
    },
    data: {
      isActive: true,
      updatedAt: new Date(),
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
  });
  return notification;
};

export const getNotificationsByPlatform = async (
  platform: NotificationPlatform,
) => {
  const notifications = await prisma.notification.findMany({
    where: {
      platform,
      isActive: true,
      deletedAt: null,
    },
    select: {
      deviceToken: true,
      isActive: true,
      platform: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return notifications;
};
