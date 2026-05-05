import express from 'express';
import userRoutes from './user.routes.js';
import clientRoutes from './client.routes.js';
import proyectoRoutes from './proyecto.routes.js';
import albaranesRoutes from './albaranes.routes.js';

const router = express.Router();

/**
 * Rutas principales de la API
 */
router.use('/user', userRoutes);
router.use('/client', clientRoutes);
router.use('/proyecto', proyectoRoutes);
router.use('/albaranes', albaranesRoutes);

export default router;
