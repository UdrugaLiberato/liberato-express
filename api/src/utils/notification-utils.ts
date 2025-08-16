import { notification } from '@prisma/client';
import { NotificationPlatform } from '../types';

export const isValidDeviceToken = (token: string): boolean => {
  return token && token.length > 0 && token.length <= 255;
};

export const isValidPlatform = (
  platform: string,
): platform is NotificationPlatform => {
  return ['ios', 'android', 'web'].includes(platform);
};

export const formatNotificationResponse = (notificationItem: notification) => {
  return {
    id: notificationItem.id,
    deviceToken: notificationItem.deviceToken,
    platform: notificationItem.platform,
    isActive: notificationItem.isActive,
    createdAt: notificationItem.createdAt,
    updatedAt: notificationItem.updatedAt,
  };
};

export const formatNotificationsResponse = (notifications: notification[]) => {
  return notifications.map((notificationItem) =>
    formatNotificationResponse(notificationItem),
  );
};

export const groupNotificationsByPlatform = (notifications: notification[]) => {
  const iosNotifications = notifications.filter((n) => n.platform === 'ios');
  const androidNotifications = notifications.filter(
    (n) => n.platform === 'android',
  );
  const webNotifications = notifications.filter((n) => n.platform === 'web');

  return {
    ios: iosNotifications,
    android: androidNotifications,
    web: webNotifications,
  } as Record<NotificationPlatform, notification[]>;
};

export const getActiveTokensByPlatform = (
  notifications: notification[],
  platform: NotificationPlatform,
): string[] => {
  return notifications
    .filter((n) => n.platform === platform && n.isActive && !n.deletedAt)
    .map((n) => n.deviceToken);
};
