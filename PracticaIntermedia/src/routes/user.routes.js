import express from 'express';
import { 
    registerCtrl, 
    loginCtrl, 
    validateEmailCtrl, 
    getAllUsers, 
    getUserById 
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/session.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { validateCodeValidator, loginValidator, userValidator } from '../validators/user.validator.js';

const router = express.Router();

/**
 * Rutas de Usuario
 */

// Registro de usuario
router.post('/register', validateRequest(userValidator), registerCtrl);

// Login de usuario
router.post('/login', validateRequest(loginValidator), loginCtrl);

// Validación de email
router.put('/validation', authMiddleware, validateRequest(validateCodeValidator), validateEmailCtrl);

// Listar usuarios (e.g. para admin)
router.get('/', authMiddleware, getAllUsers);

// Obtener usuario por ID
router.get('/:id', authMiddleware, getUserById);

export default router;
