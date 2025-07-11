import dotenv from 'dotenv';

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

dotenv.config({ path: '.env.test' });

describe('Tasks API', () => {
  let token: string;
  let testTaskId: string | null = null;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'testadmin@test.com', password: 'password' });

    const cookies = res.headers['set-cookie'];
    let bearerCookie = '';

    if (cookies) {
      const cookieList = Array.isArray(cookies) ? cookies : [cookies];
      bearerCookie =
        cookieList.find((cookie) => cookie.startsWith('BEARER=')) || '';
    }

    if (bearerCookie) {
      token = bearerCookie.split('=')[1].split(';')[0];
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a task', async () => {
    const taskData = {
      name: `Task ime ${Date.now()}`,
      priority: 'Visoka',
      is_finished: false,
      deadline: '2025-05-01T17:00:00.000Z',
    };

    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', [`BEARER=${token}`])
      .send(taskData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(taskData.name);

    testTaskId = res.body.id;
  });

  it('should get the created task', async () => {
    const res = await request(app)
      .get(`/api/tasks/${testTaskId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testTaskId);
  });

  it('should update the task', async () => {
    const updatedData = {
      name: `Updated Test Task bla${Date.now()}`,
    };

    const res = await request(app)
      .put(`/api/tasks/${testTaskId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send(updatedData);

    if (res) {
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual(updatedData.name);
    }
  });
});
