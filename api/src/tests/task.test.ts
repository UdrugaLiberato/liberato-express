import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Tasks API', () => {
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
    await prisma.task.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Task',
        priority: 'High',
        is_finished: false,
        note: 'Test note',
        deadline: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual('Test Task');
  });

  it('should get all tasks', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a single task', async () => {
    const task = await prisma.task.create({
      data: {
        name: 'Another Task',
        priority: 'Medium',
        is_finished: false,
        note: 'Another note',
        deadline: new Date(),
        created_at: new Date(),
      },
    });

    const res = await request(app)
      .get(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Another Task');
  });

  it('should delete a task', async () => {
    const task = await prisma.task.create({
      data: {
        name: 'Delete Me',
        priority: 'Low',
        is_finished: false,
        note: 'To be deleted',
        deadline: new Date(),
        created_at: new Date(),
      },
    });

    const res = await request(app)
      .delete(`/api/tasks/${task.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(204);
  });
});