import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Users API', () => {
  let token: string;
  let testUserId: string | null = null;
  let testUsername: string | null = null;
  let email: string | null = null;
  let password: string | null = null;

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

  it('should get all users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a user', async () => {
    email = `testuser${Math.floor(Math.random() * 10000)}@example.com`;
    password = 'somepassword';
    const userData = {
      email,
      phone: '1234567890',
      roles: 'USER',
      password: password,
      username: 'testuser_' + Math.floor(Math.random() * 10000),
      avatar: 'someavatar',
      createdAt: new Date().toISOString()
    };

    const res = await request(app)
      .post('/api/users')
      .set('Cookie', [`BEARER=${token}`])
      .send(userData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toEqual(email);

    testUserId = res.body.id;
    testUsername = res.body.username;
  });

  it('should get the created user', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testUserId);
  });

  it('should update the user username', async () => {
    const updatedUsername = testUsername + '_updated';
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ username: updatedUsername });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.username).toEqual(updatedUsername);
  });

  it('should delete the user', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
  });

  it('should be able to login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: email, password: password });

    expect(res.statusCode).toBe(200);
  })
});