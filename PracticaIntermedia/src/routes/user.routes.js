import express from 'express';
import {
    registerCtrl,
    loginCtrl,
    validateEmailCtrl,
    getAllUsers,
    getUserById,
    basicRegister,
    userCompany,
    userLogo,
    getUser,
    refreshTokenCtrl,
    logoutCtrl,
    deleteUser,
    changePassword
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/session.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { validateCodeValidator, loginValidator, userValidator, basicRegisterValidator, userCompanyValidator } from '../validators/user.validator.js';
import { uploadMiddleware } from '../middleware/upload.middleware.js';

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

// Actualizar datos personales
router.put('/register', authMiddleware, validateRequest(basicRegisterValidator), basicRegister);

// Asignar compañía
router.patch('/company', authMiddleware, validateRequest(userCompanyValidator), userCompany);

// Cargar logo de compañía
router.patch('/logo', authMiddleware, uploadMiddleware.single('logo'), userLogo);

// Obtener usuario autenticado
router.get('/', authMiddleware, getUser);

// Refrescar token
router.post('/refresh', refreshTokenCtrl);

// Logout
router.post('/logout', authMiddleware, logoutCtrl);

// Listar usuarios (e.g. para admin)
router.get('/list', authMiddleware, getAllUsers);

// Obtener usuario por ID
router.get('/:id', authMiddleware, getUserById);

// Eliminar usuario (soft delete)
router.delete('/:id', authMiddleware, deleteUser);

//nueva contraseña
router.post('/change-password', authMiddleware, validateRequest(newPasswordValidator), changePassword);

export default router;
