import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
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
import {
  clerkClient,
  clerkMiddleware,
  getAuth,
  requireAuth,
} from '@clerk/express';
import imageRoutes from './routes/image-routes';
import imageLocationRoutes from './routes/image-location-routes';
import authRoutes from './routes/auth-routes';
import bodyParser from 'body-parser';
import prisma from './config/prisma';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(cookieParser());
app.use(clerkMiddleware());
app.get('/', (request, res) => {
  res.send('Hello World!');
});

app.get('/user', async (req, res) => {
  const user = await clerkClient.users.getUser(
    'user_2zopSNp2MhN4Jg7BhIrIHQJFGyy',
  );

  res.json(user);
});
app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const evt = await verifyWebhook(req);
      // Do something with payload
      // For this guide, log payload to console
      const { id } = evt.data;
      const eventType = evt.type;

      if (eventType === 'user.created') {
        await prisma.clerkUser.create({
          data: {
            id: id as string,
            emailAddress: evt.data.email_addresses[0]?.email_address || '',
            externalId: evt.data.external_accounts[0]?.id || '',
            avatarUrl: evt.data.image_url || '',
            username: evt.data.username || '',
            deletedAt: null,
            lastSignInAt: evt.data.last_sign_in_at
              ? BigInt(new Date(evt.data.last_sign_in_at).getTime())
              : null,
            lastActiveAt: evt.data.last_active_at
              ? BigInt(new Date(evt.data.last_active_at).getTime())
              : null,
            createdAt: BigInt(new Date(evt.data.created_at).getTime()),
            updatedAt: BigInt(new Date(evt.data.updated_at).getTime()),
          },
        });
      }
      if (eventType === 'user.deleted') {
        console.log(evt.data);
      }
      res.send('Webhook received');
    } catch (error) {
      console.error('Error verifying webhook:', error);
      res.status(400).send('Error verifying webhook');
    }
  },
);

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const publicMetadata = auth.sessionClaims?.metadata as
    | { role?: string }
    | undefined;

  if (auth.userId && publicMetadata?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
};

app.get('/hi', requireAuth(), isAdmin, (req, res) => {
  const auth = getAuth(req);
  console.log(auth);
  res.json({
    message: 'Hello from the API!',
    userId: auth.userId,
    sessionId: auth.sessionId,
  });
});

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

app.listen(3001, () => {
  console.log(`Server is running on 3001 ${3001}`);
});

export { app };
