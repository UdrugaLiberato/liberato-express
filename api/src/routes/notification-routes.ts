import { Router } from 'express';
import * as NotificationController from '../controllers/notification-controller';

const router = Router();

router.post('/', NotificationController.createNotification);

router.get('/', NotificationController.getAllNotifications);

router.get('/:token', NotificationController.getNotificationByToken);

router.put('/:token', NotificationController.updateNotification);

router.delete('/:token', NotificationController.deleteNotification);

router.patch(
  '/:token/deactivate',
  NotificationController.deactivateNotification,
);

router.patch(
  '/:token/reactivate',
  NotificationController.reactivateNotification,
);

export default router;
