import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Locations API', () => {
  let token: string;
  let testLocationId: string | null = null;
  let testCityId: string | null = null;
  let testCategoryId: string | null = null;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@test.com', password: 'password' });

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie = cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }

    const city = await prisma.city.findFirst();
    const category = await prisma.category.findFirst();

    if (!city || !category) {
      throw new Error('Missing city or category. Please seed the database.');
    }

    testCityId = city.id;
    testCategoryId = category.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all locations', async () => {
    const res = await request(app)
      .get('/api/locations')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a location', async () => {
    const locationData = {
      categoryId: testCategoryId,
      cityId: testCityId,
      name: 'Test Location ' + Date.now(),
      street: '123 Test' + Date.now(),
      published: true,
      featured: false,
      latitude: 40.7128,
      longitude: -74.0060,
      about: 'About test ...',
    };

    const res = await request(app)
      .post('/api/locations')
      .set('Cookie', [`BEARER=${token}`])
      .send(locationData);

    if (res.statusCode !== 201) {
      console.error('Create Location Error:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(locationData.name);

    testLocationId = res.body.id;
  });

  it('should get the created location', async () => {
    const res = await request(app)
      .get(`/api/locations/${testLocationId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(testLocationId);
  });

  it('should update the location', async () => {
    const updatedData = {
      name: 'Updated Test Location' + Date.now(),
      street: '456 Updated St',
    };

    const res = await request(app)
      .put(`/api/locations/${testLocationId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send(updatedData);

    if (res.statusCode !== 200) {
      console.error('Update Location Error:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body.name).toEqual(updatedData.name);
    expect(res.body.street).toEqual(updatedData.street);
  });

  it('should delete the location', async () => {
    const res = await request(app)
      .delete(`/api/locations/${testLocationId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(204);
  });
});