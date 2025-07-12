import express from 'express';
import dotenv from 'dotenv';
import cityRoutes from './routes/city-routes';
import locationRoutes from './routes/location-routes';
import categoryRoutes from './routes/category-routes';
import userRoutes from './routes/user-routes';
import cookieParser from 'cookie-parser';
import volunteerRoutes from './routes/volunteer-routes';
import taskRoutes from './routes/task-routes';
import emailRoutes from './routes/email-routes';
import questionRoutes from './routes/question-routes';
import answerRoutes from './routes/answer-routes';
import memberRoutes from './routes/member-routes';
import { verifyWebhook } from '@clerk/express/webhooks';
import { clerkClient } from '@clerk/express';
import imageRoutes from './routes/image-routes';
import imageLocationRoutes from './routes/image-location-routes';
import authRoutes from './routes/auth-routes';
import bodyParser from 'body-parser';
import e from 'express';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cookieParser());

app.get('/', (request, res) => {
  res.send('Hello World!');
});

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req);
      
      // Do something with payload
      // For this guide, log payload to console
      const { user_id, id } = evt.data;
      const eventType = evt.type;
      console.log(
        `Received webhook with ID ${id} and event type of ${eventType}`,
      );
      console.log('Webhook payload:', evt.data);

      console.log(user_id)


  await clerkClient.users.updateUserMetadata(user_id, {
    publicMetadata: {
      role: 'admin',
    },
  })
      res.send('Webhook received');
    } catch (error) {
      console.error('Error verifying webhook:', error);
      res.status(400).send('Error verifying webhook');
    }
  },
);

app.use(express.json());
app.use('/api/auth', authRoutes);

app.use('/api/cities', cityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/answers', answerRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/image_locations', imageLocationRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export { app };
