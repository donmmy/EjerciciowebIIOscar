import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import mongoose from 'mongoose';
import Company from '../src/models/company.model.js';
import Client from '../src/models/client.model.js';
import User from '../src/models/user.model.js';

let mongoServer;
let token;
let userId;
let companyId;
let clientId;

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

describe('Project Endpoints', () => {
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
    const company = new Company({
      owner: userId,
      cif: 'A12345678',
      name: 'Test Company'
    });
    const savedCompany = await company.save();
    companyId = savedCompany._id;

    // Asignar compañía al usuario
    const user = await User.findById(userId);
    user.company = companyId;
    await user.save();

    // Crear cliente
    const clientResponse = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Client',
        cif: 'B87654321',
        email: 'client@example.com'
      });

    clientId = clientResponse.body._id;
  });

  describe('POST /api/project', () => {
    it('should create a new project', async () => {
      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Project',
          projectCode: 'PRJ-001',
          client: clientId,
          description: 'Test project description',
          status: 'activo',
          budget: 5000
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Test Project');
      expect(response.body.projectCode).toBe('PRJ-001');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/project')
        .send({
          name: 'Test Project',
          projectCode: 'PRJ-001',
          client: clientId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/project', () => {
    beforeEach(async () => {
      // Crear algunos proyectos
      await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Project 1',
          projectCode: 'PRJ-001',
          client: clientId,
          status: 'activo'
        });

      await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Project 2',
          projectCode: 'PRJ-002',
          client: clientId,
          status: 'completado'
        });
    });

    it('should list projects with pagination', async () => {
      const response = await request(app)
        .get('/api/project?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter projects by status', async () => {
      const response = await request(app)
        .get('/api/project?status=activo')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].status).toBe('activo');
    });
  });
});
