import request from 'supertest';
import app from '../src/app.js';

describe('Auth Endpoints', () => {
  let token = '';
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };

  // ✓ POST /api/auth/register → 201 con usuario creado
  describe('POST /api/auth/register', () => {
    it('debería registrar un nuevo usuario (201)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');

      token = res.body.token;
    });

    // ✓ POST /api/auth/register → 400 si email duplicado
    it('debería rechazar email duplicado', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect([400, 409]).toContain(res.status);
      expect(res.body.error).toBe(true);
    });

    // ✓ POST /api/auth/register → 400 si faltan campos
    it('debería rechazar si faltan campos (400)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete' })
        .expect(400);

      expect(res.body.error).toBe(true);
    });
  });

  // ✓ POST /api/auth/login → 201 con token cuando credenciales válidas
  describe('POST /api/auth/login', () => {
    it('debería hacer login correctamente con token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');

      token = res.body.token;
    });

    // ✓ POST /api/auth/login → 401 si contraseña incorrecta
    it('debería rechazar contraseña incorrecta (401)', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    // ✓ GET /api/auth/me → 200 con datos del usuario (requiere token)
    it('debería devolver datos del usuario con token válido (200)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.email).toBe(testUser.email);
    });

    // ✓ GET /api/auth/me → 401 sin token
    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });

  describe('PUT /api/auth/me', () => {
    // ✓ PUT /api/auth/me → 200 actualizar perfil
    it('debería actualizar el nombre del usuario (200)', async () => {
      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(res.body.data.name).toBe('Updated Name');
    });

    // ✓ PUT /api/auth/me → 200 actualizar email
    it('debería actualizar el email del usuario (200)', async () => {
      const newEmail = `updated_${Date.now()}@example.com`;
      const res = await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: newEmail })
        .expect(200);

      expect(res.body.data.email).toBe(newEmail);
    });

    // ✓ PUT /api/auth/me → 409 si email ya existe
    it('debería rechazar si email ya existe (409)', async () => {
      // Crear otro usuario
      const otherUser = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Other User',
          email: `other_${Date.now()}@example.com`,
          password: 'OtherPassword123'
        });

      // Intentar usar el email del otro usuario
      await request(app)
        .put('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: otherUser.body.user.email })
        .expect(409);
    });

    // ✓ PUT /api/auth/me → 401 sin token
    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .put('/api/auth/me')
        .send({ name: 'Unauthorized Update' })
        .expect(401);
    });
  });
});
