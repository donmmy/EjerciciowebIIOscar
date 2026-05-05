import express from 'express';
import {
    createProyecto,
    getProyectos,
    getProyectoById,
    updateProyecto,
    deleteProyecto,
    getArchivedProyectos,
    restoreProyecto
} from '../controllers/proyecto.controller.js';
import { authMiddleware } from '../middleware/session.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { proyectoValidator, proyectoUpdateValidator } from '../validators/proyecto.validator.js';

const router = express.Router();

/**
 * Rutas de Proyectos
 */

// POST /api/project - Crear proyecto
router.post('/', authMiddleware, validateRequest(proyectoValidator), createProyecto);

// GET /api/project - Listar proyectos con paginación y filtros
router.get('/', authMiddleware, getProyectos);

// GET /api/project/archived - Listar proyectos archivados
router.get('/archived', authMiddleware, getArchivedProyectos);

// GET /api/project/:id - Obtener proyecto específico
router.get('/:id', authMiddleware, getProyectoById);

// PUT /api/project/:id - Actualizar proyecto
router.put('/:id', authMiddleware, validateRequest(proyectoUpdateValidator), updateProyecto);

// DELETE /api/project/:id - Eliminar proyecto (soft o hard)
router.delete('/:id', authMiddleware, deleteProyecto);

// PATCH /api/project/:id/restore - Restaurar proyecto archivado
router.patch('/:id/restore', authMiddleware, restoreProyecto);

export default router;
