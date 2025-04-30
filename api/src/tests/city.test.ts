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
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all cities', async () => {
    const res = await request(app)
      .get('/api/cities')
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting all cities:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  let testCityId: string | null = null;
  let testCityName: string | null = null;

  it('should create a city', async () => {
    const cityName = 'Test City ' + Math.random().toString();
    const res = await request(app)
      .post('/api/cities')
      .set('Cookie', [`BEARER=${token}`])
      .send({
        name: cityName,
        latitude: 40.7128,
        longitude: 74.0060,
        radiusInKm: 50,
      });

    if (res.statusCode != 201) {
      console.error('Error creating city:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(cityName);

    testCityId = res.body.name;
    testCityId = res.body.id;
  });

  it('should get test city', async () => {
    const res = await request(app)
      .get('/api/cities/' + testCityId)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting city:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testCityId);

    testCityId = res.body.id;
  });


  it('should update test city name', async () => {
    const updatedTestCityName = testCityName + ' Updated';
    const res = await request(app)
      .put('/api/cities/' + testCityId)
      .set('Cookie', [`BEARER=${token}`])
      .send({
        name: updatedTestCityName,
      });

    if (res.statusCode !== 200) {
      console.error('Error updating city:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(updatedTestCityName);
  });

  it('should delete test city', async () => {
    const res = await request(app)
      .delete('/api/cities/' + testCityId)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error updating city:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.deletedAt).not.toBeNull();

  });

});