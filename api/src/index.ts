import { verifyWebhook } from '@clerk/express/webhooks';
import express from 'express';

const app = express();

app.post(
  '/api/webhooks',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req);

      // Do something with payload
      // For this guide, log payload to console
      const { id } = evt.data;
      const eventType = evt.type;
      console.log(
        `Received webhook with ID ${id} and event type of ${eventType}`,
      );
      console.log('Webhook payload:', evt.data);

      res.send('Webhook received');
    } catch (err) {
      console.error('Error verifying webhook:', err);
      res.status(400).send('Error verifying webhook');
    }
  },
);
app.listen(3000, () => {
  console.log(`Server is running on 3000 `);
});

export { app };
