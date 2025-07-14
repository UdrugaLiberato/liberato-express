import dotenv from 'dotenv';

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

dotenv.config({ path: '.env.test' });

describe('Questions API', () => {
  let token: string;
  let testQuestionId: string | null = null;
  const testQuestionContent: string | null = null;

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

  it('should get all questions', async () => {
    const res = await request(app)
      .get('/api/questions')
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a question', async () => {
    const category = await prisma.category.findFirst();

    if (!category || !category.id) {
      console.error('No category found.');
      return;
    }

    const res = await request(app)
      .post('/api/questions')
      .set('Cookie', [`BEARER=${token}`])
      .send({
        question: 'test pitanje',
        categoryId: category.id,
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');

    testQuestionId = res.body.id;
  });

  it('should get the created question', async () => {
    const res = await request(app)
      .get(`/api/questions/${testQuestionId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testQuestionId);
  });

  it('should update the question content', async () => {
    const updatedQuestion = 'updated question';
    const res = await request(app)
      .put(`/api/questions/${testQuestionId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ question: updatedQuestion });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.question).toEqual(updatedQuestion);
  });

  it('should delete the question', async () => {
    const res = await request(app)
      .delete(`/api/questions/${testQuestionId}`)
      .set('Cookie', [`BEARER=${token}`]);

    expect(res.statusCode).toEqual(204);
  });
});
