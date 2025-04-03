import express from 'express';
import dotenv from 'dotenv';

import cityRoutes from './routes/city-routes';
import locationRoutes from "./routes/location-routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (request, res) => {
  res.send('Hello World!');
});

app.use('/api/cities', cityRoutes);
app.use('/api/locations', locationRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
