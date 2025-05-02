import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

describe('Answers API', () => {
  let token: string;
  let testAnswerId: string | null = null;
  let questionId: string;

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

    const question = await prisma.question.findFirst();
    const author = await prisma.user.findFirst();

    if (!question || !author) {
      throw new Error('Missing test data: question or user not found');
    }

    questionId = question.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should get all answers', async () => {
    const res = await request(app)
      .get('/api/answers')
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting all answers:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create an answer', async () => {
    const res = await request(app)
      .post('/api/answers')
      .set('Cookie', [`BEARER=${token}`])
      .send({
        answer: false,
        question_id: questionId,
      });

    if (res.statusCode !== 201) {
      console.error('Error creating answer:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');

    testAnswerId = res.body.id;
  });

  it('should get the created answer', async () => {
    const res = await request(app)
      .get(`/api/answers/${testAnswerId}`)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting answer:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testAnswerId);
  });

  it('should update the answer', async () => {
    const res = await request(app)
      .put(`/api/answers/${testAnswerId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ answer: true });

    if (res.statusCode !== 200) {
      console.error('Error updating answer:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.answer).toEqual(true);
  });

  it('should delete the answer', async () => {
    const res = await request(app)
      .delete(`/api/answers/${testAnswerId}`)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error deleting answer:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body.deletedAt).not.toBeNull();
  });
});
