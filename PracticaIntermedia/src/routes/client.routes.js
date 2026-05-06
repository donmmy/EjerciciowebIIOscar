import express from 'express';
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    getArchivedClients,
    restoreClient
} from '../controllers/client.controllers.js';
import authMiddleware from '../middleware/session.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { clientValidator, clientUpdateValidator } from '../validators/client.validator.js';

const router = express.Router();

/**
 * Rutas de Clientes
 */

// POST /api/client - Crear cliente
router.post('/', authMiddleware, validateRequest(clientValidator), createClient);

// GET /api/client - Listar clientes con paginación y filtros
router.get('/', authMiddleware, getClients);

// GET /api/client/archived - Listar clientes archivados
router.get('/archived', authMiddleware, getArchivedClients);

// GET /api/client/:id - Obtener cliente específico
router.get('/:id', authMiddleware, getClientById);

// PUT /api/client/:id - Actualizar cliente
router.put('/:id', authMiddleware, validateRequest(clientUpdateValidator), updateClient);

// DELETE /api/client/:id - Eliminar cliente (soft o hard)
router.delete('/:id', authMiddleware, deleteClient);

// PATCH /api/client/:id/restore - Restaurar cliente archivado
router.patch('/:id/restore', authMiddleware, restoreClient);

export default router;
