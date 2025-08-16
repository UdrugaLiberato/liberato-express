import { Request, Response } from 'express';
import * as NotificationService from '../services/notification-service';
import {
  NotificationData,
  NotificationUpdateData,
  NotificationFilters,
  NotificationPlatform,
} from '../types';
import {
  handleError,
  sendSuccess,
  sendCreated,
  sendNoContent,
  sendNotFound,
  sendBadRequest,
  validateRequiredFields,
  handleValidationError,
} from '../utils/controller-utils';

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { deviceToken, platform, isActive }: NotificationData = req.body;

    const validationError = validateRequiredFields({ deviceToken, platform }, [
      'deviceToken',
      'platform',
    ]);
    if (validationError.length > 0) {
      return handleValidationError(res, validationError);
    }

    if (!['ios', 'android', 'web'].includes(platform)) {
      return sendBadRequest(
        res,
        'Invalid platform. Must be ios, android, or web',
      );
    }

    const existingNotification =
      await NotificationService.getNotificationByToken(deviceToken);
    if (existingNotification) {
      return sendBadRequest(res, 'Device token already registered');
    }

    const notification = await NotificationService.createNotification({
      deviceToken,
      platform,
      isActive,
    });

    sendCreated(res, notification);
  } catch (error) {
    handleError(res, error);
  }
};

export const getNotificationByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const notification =
      await NotificationService.getNotificationByToken(token);
    if (!notification) {
      return sendNotFound(res, 'Notification not found');
    }

    sendSuccess(res, notification);
  } catch (error) {
    handleError(res, error);
  }
};

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { platform, active } = req.query as {
      platform?: string;
      active?: 'true' | 'false' | 'all';
    };

    const filters: NotificationFilters & { active?: 'true' | 'false' | 'all' } =
      {};

    if (platform && ['ios', 'android', 'web'].includes(platform)) {
      filters.platform = platform as NotificationPlatform;
    }

    if (active && ['true', 'false', 'all'].includes(active)) {
      filters.active = active;
    }

    const notifications =
      await NotificationService.getAllNotifications(filters);
    sendSuccess(res, notifications);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateNotification = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const updateData: NotificationUpdateData = req.body;

    if (
      updateData.platform &&
      !['ios', 'android', 'web'].includes(updateData.platform)
    ) {
      return sendBadRequest(
        res,
        'Invalid platform. Must be ios, android, or web',
      );
    }

    const existingNotification =
      await NotificationService.getNotificationByToken(token);
    if (!existingNotification) {
      return sendNotFound(res, 'Notification not found');
    }

    const notification = await NotificationService.updateNotification(
      token,
      updateData,
    );
    sendSuccess(res, notification);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const existingNotification =
      await NotificationService.getNotificationByToken(token);
    if (!existingNotification) {
      return sendNotFound(res, 'Notification not found');
    }

    await NotificationService.deleteNotification(token);
    sendNoContent(res);
  } catch (error) {
    handleError(res, error);
  }
};

export const deactivateNotification = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const existingNotification =
      await NotificationService.getNotificationByToken(token);
    if (!existingNotification) {
      return sendNotFound(res, 'Notification not found');
    }

    const notification =
      await NotificationService.deactivateNotification(token);
    sendSuccess(res, notification);
  } catch (error) {
    handleError(res, error);
  }
};

export const reactivateNotification = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const existingNotification =
      await NotificationService.getNotificationByToken(token);
    if (!existingNotification) {
      return sendNotFound(res, 'Notification not found');
    }

    const notification =
      await NotificationService.reactivateNotification(token);
    sendSuccess(res, notification);
  } catch (error) {
    handleError(res, error);
  }
};
