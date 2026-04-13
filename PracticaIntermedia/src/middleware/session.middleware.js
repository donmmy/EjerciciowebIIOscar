import User from '../models/user.model.js';
import { verifyToken } from '../utils/handleJwt.js';
import { AppError } from '../utils/AppError.js';

/**
 * Middleware para verificar JWT token y adjuntar usuario a req
 * Valida que el token sea válido y que el usuario exista
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar que el header Authorization existe
    if (!req.headers.authorization) {
      throw AppError.unauthorized('Token no proporcionado');
    }

    // Extraer el token del header (formato: "Bearer TOKEN")
    const token = req.headers.authorization.split(' ').pop();
    
    if (!token) {
      throw AppError.unauthorized('Formato de token inválido');
    }

    // Verificar y decodificar el token
    const dataToken = verifyToken(token);

    if (!dataToken || !dataToken.userId) {
      throw AppError.unauthorized('Token inválido o expirado');
    }

    // Buscar el usuario en la BD
    const user = await User.findById(dataToken.userId);

    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado');
    }

    // Verificar si el usuario está eliminado (soft delete)
    if (user.deleted) {
      throw AppError.unauthorized('Usuario inactivo o eliminado');
    }

    // Adjuntar usuario a la request
    req.user = user;
    req.token = token;
    
    next();
  } catch (err) {
    // Si ya es un AppError, pasar directamente
    if (AppError.isAppError(err)) {
      return next(err);
    }
    
    // Otros errores se convierten en AppError
    next(AppError.unauthorized('Sesión inválida o expirada'));
  }
};

export default authMiddleware;
