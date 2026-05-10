import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import mongoose from 'mongoose';
import Company from '../src/models/company.model.js';
import Client from '../src/models/client.model.js';
import Proyecto from '../src/models/proyecto.model.js';
import User from '../src/models/user.model.js';

let mongoServer;
let token;
let userId;
let companyId;
let clientId;
let projectId;

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

describe('DeliveryNote Endpoints', () => {
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

    // Crear proyecto
    const projectResponse = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        projectCode: 'PRJ-001',
        client: clientId,
        status: 'activo'
      });

    projectId = projectResponse.body._id;
  });

  describe('POST /api/deliverynote', () => {
    it('should create a material delivery note', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Material delivery',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          quantity: 100,
          unit: 'kg'
        });

      expect(response.status).toBe(201);
      expect(response.body.format).toBe('material');
      expect(response.body.material).toBe('Cement');
    });

    it('should create a hours delivery note', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Work hours',
          format: 'hours',
          date: new Date().toISOString(),
          hours: 8,
          workers: [
            { name: 'Worker 1', hours: 8 }
          ]
        });

      expect(response.status).toBe(201);
      expect(response.body.format).toBe('hours');
      expect(response.body.workers.length).toBe(1);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .send({
          project: projectId,
          description: 'Test',
          format: 'material'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/deliverynote', () => {
    beforeEach(async () => {
      // Crear algunos albaranes
      await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Delivery 1',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          quantity: 100,
          unit: 'kg'
        });

      await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Delivery 2',
          format: 'hours',
          date: new Date().toISOString(),
          hours: 8,
          workers: [{ name: 'Worker 1', hours: 8 }]
        });
    });

    it('should list delivery notes with pagination', async () => {
      const response = await request(app)
        .get('/api/deliverynote?page=1&limit=10')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by format', async () => {
      const response = await request(app)
        .get('/api/deliverynote?format=material')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].format).toBe('material');
    });
  });

  describe('GET /api/deliverynote/pdf/:id', () => {
    let deliveryNoteId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'PDF Test',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          quantity: 100,
          unit: 'kg'
        });

      deliveryNoteId = response.body._id;
    });

    it('should generate PDF for delivery note', async () => {
      const response = await request(app)
        .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/pdf');
    });
  });

  describe('Validación Condicional', () => {
    it('should fail when format=material without material field', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Invalid material',
          format: 'material',
          date: new Date().toISOString(),
          quantity: 100,
          unit: 'kg'
          // Falta 'material'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.path.includes('material'))).toBe(true);
    });

    it('should fail when format=material without quantity field', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Invalid quantity',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          unit: 'kg'
          // Falta 'quantity'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.path.includes('quantity'))).toBe(true);
    });

    it('should fail when format=material without unit field', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Invalid unit',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          quantity: 100
          // Falta 'unit'
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.path.includes('unit'))).toBe(true);
    });

    it('should fail when format=hours without hours field', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Invalid hours',
          format: 'hours',
          date: new Date().toISOString(),
          workers: [{ name: 'Worker 1', hours: 8 }]
          // Falta 'hours' a nivel raíz
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.some(e => e.path.includes('hours'))).toBe(true);
    });

    it('should succeed when format=material with all required fields', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Valid material',
          format: 'material',
          date: new Date().toISOString(),
          material: 'Cement',
          quantity: 100,
          unit: 'kg'
        });

      expect(response.status).toBe(201);
      expect(response.body.format).toBe('material');
    });

    it('should succeed when format=hours with required hours field', async () => {
      const response = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId: projectId,
          description: 'Valid hours',
          format: 'hours',
          date: new Date().toISOString(),
          hours: 8,
          workers: [{ name: 'Worker 1', hours: 8 }]
        });

      expect(response.status).toBe(201);
      expect(response.body.format).toBe('hours');
    });
  });
});
