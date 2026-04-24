import { Router } from 'express';
import {
  getPosts,
  getAllPosts,
  getMyPosts,
  getPostBySlug,
  getPost,
  createPost,
  updatePost,
  deletePost,
  togglePublish
} from '../controllers/posts.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPostSchema, updatePostSchema, idParamSchema, slugParamSchema } from '../validators/post.validator.js';
import authMiddleware from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/posts:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Listar posts publicados
 *     description: Lista solo los posts con estado publicado
 *     responses:
 *       200:
 *         description: Lista de posts publicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get('/', getPosts);

/**
 * @openapi
 * /api/posts/admin/all:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Listar todos los posts (admin)
 *     description: Incluye posts publicados y no publicados. Solo para admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los posts
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Acceso denegado
 */
router.get('/admin/all', authMiddleware, checkRol(['admin']), getAllPosts);

/**
 * @openapi
 * /api/posts/my:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Listar posts del usuario actual
 *     description: Lista todos los posts creados por el usuario autenticado (author y admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de posts del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/my', authMiddleware, checkRol(['author', 'admin']), getMyPosts);

/**
 * @openapi
 * /api/posts/{slug}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Obtener post por slug
 *     description: Devuelve un post publicado por su slug único
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post encontrado
 *       404:
 *         description: Post no encontrado
 */
router.get('/:slug', validate(slugParamSchema), getPostBySlug);

/**
 * @openapi
 * /api/posts:
 *   post:
 *     tags:
 *       - Posts
 *     summary: Crear un nuevo post
 *     description: Crea un nuevo post. Solo authors y admin.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               featured:
 *                 type: string
 *               published:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Post creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, checkRol(['author', 'admin']), validate(createPostSchema), createPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   get:
 *     tags:
 *       - Posts
 *     summary: Obtener post por ID
 *     description: Devuelve un post por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post encontrado
 *       404:
 *         description: Post no encontrado
 */
router.get('/:id', validate(idParamSchema), getPost);

/**
 * @openapi
 * /api/posts/{id}:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Actualizar un post
 *     description: Actualiza un post. Solo el autor o admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePost'
 *     responses:
 *       200:
 *         description: Post actualizado exitosamente
 *       404:
 *         description: Post no encontrado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id', authMiddleware, validate(idParamSchema), validate(updatePostSchema), updatePost);

/**
 * @openapi
 * /api/posts/{id}:
 *   delete:
 *     tags:
 *       - Posts
 *     summary: Eliminar un post
 *     description: Elimina un post. Solo el autor o admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post eliminado exitosamente
 *       404:
 *         description: Post no encontrado
 *       403:
 *         description: Acceso denegado
 */
router.delete('/:id', authMiddleware, validate(idParamSchema), deletePost);

/**
 * @openapi
 * /api/posts/{id}/publish:
 *   put:
 *     tags:
 *       - Posts
 *     summary: Publicar/Despublicar un post
 *     description: Cambia el estado de publicación de un post. Solo el autor o admin.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado
 *       404:
 *         description: Post no encontrado
 *       403:
 *         description: Acceso denegado
 */
router.put('/:id/publish', authMiddleware, validate(idParamSchema), togglePublish);

export default router;
