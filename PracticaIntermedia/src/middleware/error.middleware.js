import { AppError } from '../utils/AppError.js';

export const notFound = (req, res, next) => {
  res.status(404).json({
    error: true,
    statusCode: 404,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
  });
};

/**
 * Middleware centralizado de manejo de errores
 * Gestiona errores de la aplicación, JWT, Mongoose, Zod y otros
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error('❌ Error:', {
    message: err.message,
    name: err.name,
    statusCode: err.statusCode || 500,
    stack: err.stack
  });

  // Errores de AppError (errores de aplicación controlados)
  if (AppError.isAppError(err)) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Errores JWT
  if (err.name === 'JsonWebTokenError') {
    const appError = AppError.unauthorized('Token inválido o malformado');
    return res.status(appError.statusCode).json(appError.toJSON());
  }

  if (err.name === 'TokenExpiredError') {
    const appError = AppError.unauthorized('Token expirado');
    return res.status(appError.statusCode).json(appError.toJSON());
  }

  // Errores Mongoose - Validación
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    const appError = AppError.badRequest(`Validación fallida: ${messages.join(', ')}`);
    return res.status(appError.statusCode).json(appError.toJSON());
  }

  // Errores Mongoose - Cast (ID inválido)
  if (err.name === 'CastError') {
    const appError = AppError.badRequest('ID inválido');
    return res.status(appError.statusCode).json(appError.toJSON());
  }

  // Errores Mongoose - Clave duplicada
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    const message = `Ya existe un registro con ese '${field}'`;
    const appError = AppError.conflict(message);
    return res.status(appError.statusCode).json(appError.toJSON());
  }

  // Errores Zod - Validación de esquema
  if (err.name === 'ZodError') {
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      error: true,
      statusCode: 400,
      message: 'Error de validación',
      details,
      timestamp: new Date()
    });
  }

  // Errores genéricos
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';
  
  res.status(statusCode).json({
    error: true,
    statusCode,
    message,
    timestamp: new Date(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
