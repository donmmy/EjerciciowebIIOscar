import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import mongoose from 'mongoose';
import Company from '../src/models/company.model.js';
import User from '../src/models/user.model.js';

let mongoServer;
let token;
let userId;
let companyId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('Client Endpoints', () => {
  beforeEach(async () => {
    // Registrar usuario
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
    userId = registerResponse.body.user._id;

    // Crear compañía
    const user = await User.findById(userId);
    const company = new Company({
      owner: userId,
      cif: 'A12345678',
      name: 'Test Company'
    });
    const savedCompany = await company.save();
    companyId = savedCompany._id;

    // Asignar compañía al usuario
    user.company = companyId;
    await user.save();
  });

  describe('POST /api/client', () => {
    it('should create a new client', async () => {
      const response = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Client',
          cif: 'B87654321',
          email: 'client@example.com',
          phone: '+34612345678',
          address: {
            street: 'Calle Test',
            number: '42',
            postal: '28001',
            city: 'Madrid',
            province: 'Madrid'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Client');
      expect(response.body.cif).toBe('B87654321');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/client')
        .send({
          name: 'Test Client',
          cif: 'B87654321',
          email: 'client@example.com'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/client', () => {
    beforeEach(async () => {
      // Crear algunos clientes
      await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Client 1',
          cif: 'B87654321',
          email: 'client1@example.com'
        });

      await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Client 2',
          cif: 'C12345678',
          email: 'client2@example.com'
        });
    });

    it('should list clients with pagination', async () => {
      const response = await request(app)
        .get('/api/client?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
    });

    it('should filter clients by name', async () => {
      const response = await request(app)
        .get('/api/client?name=Client%201')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Client 1');
    });
  });

  describe('DELETE /api/client/:id', () => {
    let clientId;

    beforeEach(async () => {
      const createResponse = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Client',
          cif: 'B87654321',
          email: 'client@example.com'
        });

      clientId = createResponse.body._id;
    });

    it('should soft delete a client', async () => {
      const response = await request(app)
        .delete(`/api/client/${clientId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('eliminado');
    });
  });
});
