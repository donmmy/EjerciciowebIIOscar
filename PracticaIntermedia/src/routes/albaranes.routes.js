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
 * Rutas de Notas de Entrega (Albaranes)
 */

// POST /api/deliverynote - Crear albarán
router.post('/', authMiddleware, validateRequest(deliverNoteValidator), createDeliverNote);

// GET /api/deliverynote - Listar albaranes con filtros y paginación
router.get('/', authMiddleware, getDeliverNotes);

// GET /api/deliverynote/pdf/:id - Descargar PDF del albarán (ruta específica antes de :id genérica)
router.get('/pdf/:id', authMiddleware, getDeliverNotePDF);

// GET /api/deliverynote/:id - Obtener albarán específico
router.get('/:id', authMiddleware, getDeliverNoteById);

// PATCH /api/deliverynote/:id/sign - Firmar albarán con imagen de firma
router.patch('/:id/sign', authMiddleware, uploadMiddleware.single('signature'), signDeliverNote);

// DELETE /api/deliverynote/:id - Borrar albarán (solo si no está firmado)
router.delete('/:id', authMiddleware, deleteDeliverNote);

export default router;
