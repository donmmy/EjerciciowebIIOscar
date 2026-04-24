import request from 'supertest';
import app from '../src/app.js';

describe('Posts Endpoints', () => {
  let authorToken = '';
  let userToken = '';
  let adminToken = '';
  let postId = '';
  let postSlug = '';

  beforeAll(async () => {
    // Crear usuario author
    const authorRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Post Author',
        email: `author_${Date.now()}@example.com`,
        password: 'AuthorPassword123'
      });
    authorToken = authorRes.body.token;

    // Crear usuario normal
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Post User',
        email: `user_${Date.now()}@example.com`,
        password: 'UserPassword123'
      });
    userToken = userRes.body.token;

    // Crear usuario admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Post Admin',
        email: `admin_${Date.now()}@example.com`,
        password: 'AdminPassword123'
      });
    adminToken = adminRes.body.token;

    // Cambiar rol a author y admin directamente en BD
    const mongoose = (await import('mongoose')).default;
    await mongoose.model('User').findByIdAndUpdate(
      authorRes.body.user._id,
      { role: 'author' }
    );
    await mongoose.model('User').findByIdAndUpdate(
      adminRes.body.user._id,
      { role: 'admin' }
    );
  });

  // GET /api/posts — solo publicados
  describe('GET /api/posts', () => {
    it('debería obtener lista de posts publicados (200)', async () => {
      const res = await request(app)
        .get('/api/posts')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // POST /api/posts — crear post (requiere author o admin)
  describe('POST /api/posts', () => {
    it('debería crear un post con token author (201)', async () => {
      const post = {
        title: 'Mi Primer Post de Blog',
        content: 'Este es el contenido del post de prueba que debe tener al menos 10 caracteres',
        excerpt: 'Resumen corto',
        tags: ['blog', 'nodejs']
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send(post)
        .expect(201);

      expect(res.body.data.title).toBe(post.title);
      expect(res.body.data.slug).toBe('mi-primer-post-de-blog');
      expect(res.body.data.published).toBe(false);
      postId = res.body.data._id;
      postSlug = res.body.data.slug;
    });

    // POST /api/posts — rechazar sin token
    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .post('/api/posts')
        .send({
          title: 'Sin Auth',
          content: 'Contenido sin autenticación'
        })
        .expect(401);
    });

    // POST /api/posts — rechazar para rol user
    it('debería rechazar para rol user (403)', async () => {
      await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User intenta crear',
          content: 'User no puede crear posts'
        })
        .expect(403);
    });
  });

  // GET /api/posts/:slug — obtener post por slug
  describe('GET /api/posts/:slug', () => {
    it('debería obtener post por slug (200)', async () => {
      const res = await request(app)
        .get(`/api/posts/${postSlug}`)
        .expect(200);

      expect(res.body.data.slug).toBe(postSlug);
      expect(res.body.data.views).toBeGreaterThan(0);
    });

    it('debería retornar 404 para slug no existe', async () => {
      await request(app)
        .get('/api/posts/slug-inexistente')
        .expect(404);
    });
  });

  // GET /api/posts/my — posts del usuario autenticado
  describe('GET /api/posts/my', () => {
    it('debería obtener posts del usuario author (200)', async () => {
      const res = await request(app)
        .get('/api/posts/my')
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debería rechazar para rol user (403)', async () => {
      await request(app)
        .get('/api/posts/my')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .get('/api/posts/my')
        .expect(401);
    });
  });

  // PUT /api/posts/:id — actualizar post (solo autor o admin)
  describe('PUT /api/posts/:id', () => {
    it('debería permitir actualizar para autor (200)', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({ title: 'Título Actualizado' })
        .expect(200);

      expect(res.body.data.title).toBe('Título Actualizado');
    });

    it('debería rechazar para user no autor (403)', async () => {
      await request(app)
        .put(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'No puedo actualizar' })
        .expect(403);
    });

    it('debería rechazar sin token (401)', async () => {
      await request(app)
        .put(`/api/posts/${postId}`)
        .send({ title: 'No puedo actualizar' })
        .expect(401);
    });
  });

  // PUT /api/posts/:id/publish — publicar/despublicar
  describe('PUT /api/posts/:id/publish', () => {
    it('debería permitir publicar para autor (200)', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(res.body.data.published).toBe(true);
    });

    it('debería permitir despublicar para autor (200)', async () => {
      const res = await request(app)
        .put(`/api/posts/${postId}/publish`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(res.body.data.published).toBe(false);
    });
  });

  // GET /api/posts/admin/all — todos los posts (admin)
  describe('GET /api/posts/admin/all', () => {
    it('debería devolver todos los posts para admin (200)', async () => {
      const res = await request(app)
        .get('/api/posts/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debería rechazar para rol user (403)', async () => {
      await request(app)
        .get('/api/posts/admin/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('debería rechazar para author (403)', async () => {
      await request(app)
        .get('/api/posts/admin/all')
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(403);
    });
  });

  // DELETE /api/posts/:id — eliminar post
  describe('DELETE /api/posts/:id', () => {
    it('debería permitir eliminar para admin (200)', async () => {
      // Crear post para eliminar
      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Post para eliminar',
          content: 'Este post será eliminado por el admin'
        });

      const idToDelete = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/posts/${idToDelete}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.message).toBe('Post eliminado exitosamente');
    });

    it('debería permitir eliminar para autor (200)', async () => {
      // Crear post para eliminar
      const createRes = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          title: 'Post personal para eliminar',
          content: 'Este post será eliminado por su autor'
        });

      const idToDelete = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/posts/${idToDelete}`)
        .set('Authorization', `Bearer ${authorToken}`)
        .expect(200);

      expect(res.body.message).toBe('Post eliminado exitosamente');
    });

    it('debería rechazar para user no autor (403)', async () => {
      await request(app)
        .delete(`/api/posts/${postId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
