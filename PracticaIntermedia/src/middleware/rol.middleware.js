import { AppError } from '../utils/AppError.js';

/**
 * Middleware de autorización basado en rol único
 * @param {string} rolRequerido - El rol requerido para acceder
 * @returns {Function} Middleware
 */
const checkRol = (rolRequerido) => (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      throw AppError.unauthorized('Usuario no autenticado');
    }

    if (user.role !== rolRequerido) {
      throw AppError.forbidden(`Se requiere el rol '${rolRequerido}' para acceder a este recurso`);
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware de autorización basado en múltiples roles
 * @param {string[]} rolesPermitidos - Array de roles permitidos
 * @returns {Function} Middleware
 */
export const checkRoles = (rolesPermitidos = []) => (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      throw AppError.unauthorized('Usuario no autenticado');
    }

    if (!rolesPermitidos.includes(user.role)) {
      throw AppError.forbidden(
        `Se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Middleware específico para administradores
 */
export const isAdmin = checkRol('admin');

/**
 * Middleware específico para guests
 */
export const isGuest = checkRol('guest');

/**
 * Middleware específico para admin o propietario del recurso
 */
export const isAdminOrOwner = (fieldName = 'id') => (req, res, next) => {
  try {
    const { user } = req;

    if (!user) {
      throw AppError.unauthorized('Usuario no autenticado');
    }

    const resourceOwnerId = req.params[fieldName] || req.body[fieldName];

    if (user.role !== 'admin' && user._id.toString() !== resourceOwnerId) {
      throw AppError.forbidden('No tienes permiso para acceder a este recurso');
    }

    next();
  } catch (err) {
    next(err);
  }
};

export default checkRol;
