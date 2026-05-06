import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import mongoose from 'mongoose';

let mongoServer;

// Setup
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Teardown
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Limpiar colecciones después de cada test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Auth Endpoints', () => {
  describe('POST /api/user/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'Password123456',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should fail with duplicate email', async () => {
      // Primer registro
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'Password123456',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });

      // Intento duplicado
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'Password123456',
          name: 'Jane',
          lastName: 'Smith',
          nif: '87654321B',
          role: 'guest'
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('existe');
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'invalid-email',
          password: 'Password123456',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });

      expect(response.status).toBe(400);
    });

    it('should fail with short password', async () => {
      const response = await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'short',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/user/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'Password123456',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'test@example.com',
          password: 'Password123456'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123'
        });

      expect(response.status).toBe(401);
    });

    it('should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/user/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123456'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/user', () => {
    let token;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/user/register')
        .send({
          email: 'test@example.com',
          password: 'Password123456',
          name: 'John',
          lastName: 'Doe',
          nif: '12345678A',
          role: 'admin'
        });

      token = registerResponse.body.accessToken;
    });

    it('should get authenticated user', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('John');
    });

    it('should fail without token', async () => {
      const response = await request(app)
        .get('/api/user');

      expect(response.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
