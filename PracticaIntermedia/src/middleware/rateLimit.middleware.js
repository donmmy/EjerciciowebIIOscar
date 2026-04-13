import rateLimit from 'express-rate-limit';

/**
 * Limite de tasa general para toda la API
 * 100 solicitudes por 15 minutos por IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: true,
    statusCode: 429,
    message: 'Demasiadas solicitudes, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Saltarse en desarrollo
});

/**
 * Limite de tasa estricto para autenticación
 * 5 intentos por 15 minutos por IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: {
    error: true,
    statusCode: 429,
    message: 'Demasiados intentos de autenticación, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Contar solo solicitudes fallidas
  skip: (req) => process.env.NODE_ENV === 'development' // Saltarse en desarrollo
});

/**
 * Límite de tasa moderado para operaciones de escritura
 * 30 solicitudes por 15 minutos por IP
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30,
  message: {
    error: true,
    statusCode: 429,
    message: 'Demasiadas solicitudes de escritura, intenta más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' // Saltarse en desarrollo
});

export default {
  generalLimiter,
  authLimiter,
  writeLimiter
};
