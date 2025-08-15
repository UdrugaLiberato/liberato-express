import { Request, Response } from 'express';
import { verifyWebhook } from '@clerk/express/webhooks';
import * as clerkWebhookService from '../services/clerk-webhook-service';
import { handleError, sendSuccess } from '../utils/controller-utils';

// Helper function to serialize BigInt values
const serializeBigInt = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint') return obj.toString();
  if (typeof obj === 'object') {
    if (Array.isArray(obj)) {
      return obj.map((item) => serializeBigInt(item));
    }
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)]),
    );
  }
  return obj;
};

const handleClerkWebhook = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    let result;

    switch (evt.type) {
      case 'user.created': {
        result = await clerkWebhookService.handleUserCreated(evt);
        break;
      }

      case 'user.updated': {
        result = await clerkWebhookService.handleUserUpdated(evt);
        break;
      }

      case 'user.deleted': {
        result = await clerkWebhookService.handleUserDeleted(evt);
        break;
      }

      case 'session.created': {
        result = await clerkWebhookService.handleSessionCreated(evt);
        break;
      }

      case 'session.ended': {
        result = await clerkWebhookService.handleSessionEnded(evt);
        break;
      }

      case 'session.revoked': {
        result = await clerkWebhookService.handleSessionRevoked(evt);
        break;
      }

      case 'session.removed': {
        result = await clerkWebhookService.handleSessionRemoved(evt);
        break;
      }

      case 'role.created': {
        result = await clerkWebhookService.handleRoleCreated(evt);
        break;
      }

      case 'role.updated': {
        result = await clerkWebhookService.handleRoleUpdated(evt);
        break;
      }

      case 'role.deleted': {
        result = await clerkWebhookService.handleRoleDeleted(evt);
        break;
      }

      default: {
        sendSuccess(res, {
          message: 'Webhook received but not processed',
          eventType: evt.type,
        });
        return;
      }
    }

    sendSuccess(res, {
      message: 'Webhook processed successfully',
      eventType: evt.type,
      ...serializeBigInt(result),
    });
  } catch (error) {
    console.error('❌ Clerk webhook error:', error);
    handleError(res, error, 'Webhook processing failed');
  }
};

export default handleClerkWebhook;
