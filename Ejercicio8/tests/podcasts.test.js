import request from 'supertest';
import app from '../src/app.js';

describe('Podcasts Endpoints', () => {
  let userToken = '';
  let adminToken = '';
  let podcastId = '';

  beforeAll(async () => {
    // Crear usuario normal
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Podcast User',
        email: `poduser_${Date.now()}@example.com`,
        password: 'TestPassword123'
      });
    userToken = userRes.body.token;

    // Crear usuario admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Podcast Admin',
        email: `podadmin_${Date.now()}@example.com`,
        password: 'AdminPassword123'
      });
    adminToken = adminRes.body.token;

    // Cambiar rol a admin directamente en BD
    const mongoose = (await import('mongoose')).default;
    await mongoose.model('User').findByIdAndUpdate(
      adminRes.body.user._id,
      { role: 'admin' }
    );
  });

  // ✓ GET /api/podcasts → 200 con array (solo publicados)
  describe('GET /api/podcasts', () => {
    it('debería obtener lista de podcasts publicados (200)', async () => {
      const res = await request(app)
        .get('/api/podcasts')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ✓ POST /api/podcasts → 201 con podcast creado (requiere token)
  describe('POST /api/podcasts', () => {
    it('debería crear un podcast con token (201)', async () => {
      const podcast = {
        title: 'Test Podcast',
        description: 'Un podcast de prueba',
        duration: 3600,
        categories: ['tecnología']
      };

      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send(podcast)
        .expect(201);

      expect(res.body.data.title).toBe(podcast.title);
      expect(res.body.data.published).toBe(false);
      podcastId = res.body.data._id;
    });

    // ✓ POST /api/podcasts → 401 sin token
    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .post('/api/podcasts')
        .send({ title: 'Sin Auth', duration: 1800 })
        .expect(401);
    });
  });

  // ✓ DELETE /api/podcasts/:id → 403 para user normal
  describe('DELETE /api/podcasts/:id', () => {
    it('debería rechazar para rol user (403)', async () => {
      await request(app)
        .delete(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    // ✓ DELETE /api/podcasts/:id → 200 solo para admin
    it('debería permitir eliminar para admin (200)', async () => {
      // Crear otro podcast para que el admin lo elimine
      const createRes = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Para eliminar', duration: 600 });

      const idToDelete = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/podcasts/${idToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Podcast eliminado');
    });
  });

  // ✓ GET /api/podcasts/admin/all → 200 solo para admin
  describe('GET /api/podcasts/admin/all', () => {
    it('debería devolver todos los podcasts para admin (200)', async () => {
      const res = await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debería rechazar para rol user (403)', async () => {
      await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
