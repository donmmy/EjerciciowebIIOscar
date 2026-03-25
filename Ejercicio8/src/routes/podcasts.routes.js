import { Router } from 'express';
import {
  getPodcasts,
  getAllPodcasts,
  getPodcast,
  createPodcast,
  updatePodcast,
  deletePodcast,
  togglePublish
} from '../controllers/podcasts.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { createPodcastSchema, updatePodcastSchema, idParamSchema } from '../validators/podcast.validator.js';
import authMiddleware from '../middleware/session.middleware.js';
import checkRol from '../middleware/rol.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/podcasts:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar podcasts publicados
 *     description: Lista solo los podcasts con estado publicado
 *     responses:
 *       200:
 *         description: Lista de podcasts publicados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Podcast'
 */
router.get('/', getPodcasts);

/**
 * @openapi
 * /api/podcasts/admin/all:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Listar todos los podcasts (admin)
 *     description: Incluye podcasts publicados y no publicados
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de podcasts
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 */
router.get('/admin/all',
  authMiddleware,
  checkRol('admin'),
  getAllPodcasts
);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   get:
 *     tags:
 *       - Podcasts
 *     summary: Obtener podcast por ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del podcast (MongoDB ObjectId)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast encontrado
 *       404:
 *         description: Podcast no encontrado
 */
router.get('/:id', validate(idParamSchema), getPodcast);

/**
 * @openapi
 * /api/podcasts:
 *   post:
 *     tags:
 *       - Podcasts
 *     summary: Crear un podcast
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
 *               - duration
 *             properties:
 *               title:
 *                 type: string
 *                 example: Mi Podcast
 *               description:
 *                 type: string
 *                 example: Un podcast sobre tecnología
 *               duration:
 *                 type: integer
 *                 example: 3600
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["tecnología", "ciencia"]
 *               coverImage:
 *                 type: string
 *                 example: https://example.com/cover.jpg
 *     responses:
 *       201:
 *         description: Podcast creado
 *       401:
 *         description: No autorizado
 */
router.post('/',
  authMiddleware,
  validate(createPodcastSchema),
  createPodcast
);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   put:
 *     tags:
 *       - Podcasts
 *     summary: Actualizar propio podcast
 *     description: Solo el autor del podcast puede actualizarlo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               duration:
 *                 type: integer
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               coverImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Podcast actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: No es el autor del podcast
 *       404:
 *         description: Podcast no encontrado
 */
router.put('/:id',
  authMiddleware,
  validate(idParamSchema),
  validate(updatePodcastSchema),
  updatePodcast
);

/**
 * @openapi
 * /api/podcasts/{id}:
 *   delete:
 *     tags:
 *       - Podcasts
 *     summary: Eliminar un podcast
 *     description: Solo administradores pueden eliminar podcasts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Podcast eliminado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Podcast no encontrado
 */
router.delete('/:id',
  authMiddleware,
  checkRol('admin'),
  validate(idParamSchema),
  deletePodcast
);

/**
 * @openapi
 * /api/podcasts/{id}/publish:
 *   patch:
 *     tags:
 *       - Podcasts
 *     summary: Publicar/despublicar un podcast
 *     description: Solo administradores pueden cambiar el estado de publicación
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estado de publicación actualizado
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Podcast no encontrado
 */
router.patch('/:id/publish',
  authMiddleware,
  checkRol('admin'),
  validate(idParamSchema),
  togglePublish
);

export default router;
