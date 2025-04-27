import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Cities API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testviktor@test.com', password: 'password' });

    const cookies = res.headers['set-cookie'];
    console.log(cookies);

    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie = cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }
  });

  afterAll(async () => {
    await prisma.city.deleteMany(); // Clean up cities
    await prisma.$disconnect();
  });

  it('should create a city', async () => {
    const res = await request(app)
      .post('/api/cities')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        radiusInKm: 50,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Test City');
  });

  it('should get all cities', async () => {
    const res = await request(app)
      .get('/api/cities')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a single city', async () => {
    const city = await prisma.city.create({
      data: {
        name: 'Another City',
        latitude: 48.8566,
        longitude: 2.3522,
        radiusInKm: 30,
      },
    });

    const res = await request(app)
      .get(`/api/cities/${city.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Another City');
  });

  it('should delete a city', async () => {
    const city = await prisma.city.create({
      data: {
        name: 'Delete City',
        latitude: 34.0522,
        longitude: -118.2437,
        radiusInKm: 70,
      },
    });

    const res = await request(app)
      .delete(`/api/cities/${city.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});