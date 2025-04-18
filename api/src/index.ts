import express from 'express';
import dotenv from 'dotenv';
import cityRoutes from './routes/city-routes';
import locationRoutes from './routes/location-routes';
import categoryRoutes from "./routes/category-routes";
// import {authenticate} from "./middleware/authenticate";
// import {checkRoleAccess} from "./middleware/check-role";
// import authRoutes from './routes/auth-routes';
import userRoutes from "./routes/user-routes";
import cookieParser from 'cookie-parser';
import volunteerRoutes from "./routes/volunteer-routes";
import taskRoutes from "./routes/task-routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (request, res) => {
  res.send('Hello World!');
});

// app.use('/api/auth', authRoutes);

// app.use(authenticate);
// app.use(checkRoleAccess);

app.use('/api/cities', cityRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
