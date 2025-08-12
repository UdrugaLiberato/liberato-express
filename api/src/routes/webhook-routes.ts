import { verifyWebhook } from '@clerk/express/webhooks';
import { Router } from 'express';

const router = Router();

router.post('/clerk', async (req, res) => {
  try {
    const evt = await verifyWebhook(req);
    console.log('✅ Webhook verified successfully with Clerk');
    console.log('Webhook payload:', evt.data);
    console.log('Webhook type:', evt.type);
    console.log('Webhook ID:', evt.data.id);
    console.log('Webhook event type:', evt.type);
    console.log('Webhook event ID:', evt.data.id);
    console.log('Webhook event data:', evt.data);
    console.log('Webhook event type:', evt.type);
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return res.status(400).json({
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
