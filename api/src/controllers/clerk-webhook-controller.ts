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
    // Convert raw buffer to string for Clerk verification
    const payload = req.body.toString();
    const headers = req.headers;
    
    const evt = await verifyWebhook(payload, headers);

    console.log(`✅ Clerk webhook verified: ${evt.type} - ${evt.data.id}`);

    let result;

    switch (evt.type) {
      case 'user.created': {
        result = await clerkWebhookService.handleUserCreated(evt);
        console.log(`✅ User created in database: ${result.id}`);
        break;
      }

      case 'user.updated': {
        result = await clerkWebhookService.handleUserUpdated(evt);
        console.log(`✅ User updated in database: ${result.id}`);
        break;
      }

      case 'user.deleted': {
        result = await clerkWebhookService.handleUserDeleted(evt);
        console.log(`✅ User deleted from database: ${result.id}`);
        break;
      }

      case 'session.created': {
        result = await clerkWebhookService.handleSessionCreated(evt);
        console.log(`✅ Session created: ${result.sessionId}`);
        break;
      }

      case 'session.ended': {
        result = await clerkWebhookService.handleSessionEnded(evt);
        console.log(`✅ Session ended: ${result.sessionId}`);
        break;
      }

      case 'session.revoked': {
        result = await clerkWebhookService.handleSessionRevoked(evt);
        console.log(`✅ Session revoked: ${result.sessionId}`);
        break;
      }

      case 'session.removed': {
        result = await clerkWebhookService.handleSessionRemoved(evt);
        console.log(`✅ Session removed: ${result.sessionId}`);
        break;
      }

      case 'role.created': {
        result = await clerkWebhookService.handleRoleCreated(evt);
        console.log(`✅ Role created: ${result.roleId}`);
        break;
      }

      case 'role.updated': {
        result = await clerkWebhookService.handleRoleUpdated(evt);
        console.log(`✅ Role updated: ${result.roleId}`);
        break;
      }

      case 'role.deleted': {
        result = await clerkWebhookService.handleRoleDeleted(evt);
        console.log(`✅ Role deleted: ${result.roleId}`);
        break;
      }

      default: {
        console.log(`⚠️ Unhandled webhook event type: ${evt.type}`);
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
