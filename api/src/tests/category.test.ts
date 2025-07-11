import dotenv from 'dotenv';

import request from 'supertest';
import { app } from '../index';
import prisma from '../config/prisma';

dotenv.config({ path: '.env.test' });

describe('Categories API', () => {
  let token: string;
  let testCategoryId: string | null = null;
  let testCategoryName: string | null = null;

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

  it('should get all categories', async () => {
    const res = await request(app)
      .get('/api/categories')
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting all categories:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should create a category', async () => {
    const categoryName = `Test Category ${Math.random().toString()}`;
    const res = await request(app)
      .post('/api/categories')
      .set('Cookie', [`BEARER=${token}`])
      .send({
        name: categoryName,
        description: 'A category for testing',
      });

    if (res.statusCode !== 201) {
      console.error('Error creating category:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(categoryName);

    testCategoryName = res.body.name;
    testCategoryId = res.body.id;
  });

  it('should get the created category', async () => {
    const res = await request(app)
      .get(`/api/categories/${testCategoryId}`)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error getting category:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(testCategoryId);
  });

  it('should update the category name', async () => {
    const updatedName = `${testCategoryName} Updated`;
    const res = await request(app)
      .put(`/api/categories/${testCategoryId}`)
      .set('Cookie', [`BEARER=${token}`])
      .send({ name: updatedName });

    if (res.statusCode !== 200) {
      console.error('Error updating category:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toEqual(updatedName);
  });

  it('should delete the category', async () => {
    const res = await request(app)
      .delete(`/api/categories/${testCategoryId}`)
      .set('Cookie', [`BEARER=${token}`]);

    if (res.statusCode !== 200) {
      console.error('Error deleting category:', res.statusCode, res.body);
    }

    expect(res.statusCode).toEqual(200);
    expect(res.body.deletedAt).not.toBeNull();
  });
});
