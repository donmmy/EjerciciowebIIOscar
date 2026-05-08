import express from 'express';
import {
    createDeliverNote,
    getDeliverNotes,
    getDeliverNoteById,
    getDeliverNotePDF,
    signDeliverNote,
    deleteDeliverNote
} from '../controllers/albaranes.controller.js';
import authMiddleware from '../middleware/session.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { deliverNoteValidator } from '../validators/deliverNote.validator.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Crear un nuevo albarán
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       400:
 *         description: Validación fallida
 *       401:
 *         description: No autorizado
 */
router.post('/', authMiddleware, validateRequest(deliverNoteValidator), createDeliverNote);

/**
 * @swagger
 * /api/deliverynote:
 *   get:
 *     summary: Listar albaranes con paginación y filtros
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *           schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [material, hours]
 *     responses:
 *       200:
 *         description: Lista de albaranes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeliveryNote'
 *                 pagination:
 *                   type: object
 *       401:
 *         description: No autorizado
 */
router.get('/', authMiddleware, getDeliverNotes);

/**
 * @swagger
 * /api/deliverynote/pdf/{id}:
 *   get:
 *     summary: Descargar PDF del albarán
 *     tags: [DeliveryNotes]
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
 *         description: PDF del albarán
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Albarán no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/pdf/:id', authMiddleware, getDeliverNotePDF);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán específico
 *     tags: [DeliveryNotes]
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
 *         description: Albarán encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeliveryNote'
 *       404:
 *         description: Albarán no encontrado
 *       401:
 *         description: No autorizado
 */
router.get('/:id', authMiddleware, getDeliverNoteById);

/**
 * @swagger
 * /api/deliverynote/{id}/sign:
 *   patch:
 *     summary: Firmar un albarán
 *     tags: [DeliveryNotes]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Albarán firmado exitosamente
 *       404:
 *         description: Albarán no encontrado
 *       400:
 *         description: Albarán ya firmado
 *       401:
 *         description: No autorizado
 */
router.patch('/:id/sign', authMiddleware, uploadMiddleware.single('signature'), signDeliverNote);

/**
 * @swagger
 * /api/deliverynote/{id}:
 *   delete:
 *     summary: Borrar un albarán
 *     tags: [DeliveryNotes]
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
 *         description: Albarán eliminado exitosamente
 *       404:
 *         description: Albarán no encontrado
 *       400:
 *         description: No se puede eliminar albarán firmado
 *       401:
 *         description: No autorizado
 */
router.delete('/:id', authMiddleware, deleteDeliverNote);

export default router;
