/**
 * Clase centralizada para manejar errores de la aplicación
 * Proporciona métodos factoría para crear instancias de error con códigos HTTP específicos
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date();
    
    // Capturar la traza de errores
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Método factoría para error de validación (400)
   */
  static badRequest(message = 'Invalid request') {
    return new AppError(message, 400);
  }

  /**
   * Método factoría para no autorizado (401)
   */
  static unauthorized(message = 'Unauthorized') {
    return new AppError(message, 401);
  }

  /**
   * Método factoría para prohibido (403)
   */
  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403);
  }

  /**
   * Método factoría para no encontrado (404)
   */
  static notFound(message = 'Not found') {
    return new AppError(message, 404);
  }

  /**
   * Método factoría para conflicto (409)
   */
  static conflict(message = 'Conflict') {
    return new AppError(message, 409);
  }

  /**
   * Método factoría para demasiadas solicitudes (429)
   */
  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429);
  }

  /**
   * Método factoría para error interno del servidor (500)
   */
  static internalServerError(message = 'Internal server error') {
    return new AppError(message, 500);
  }

  /**
   * Método factoría para error genérico con código HTTP personalizado
   */
  static custom(message, statusCode) {
    return new AppError(message, statusCode);
  }

  /**
   * Verificar si es un error de aplicación
   */
  static isAppError(error) {
    return error instanceof AppError;
  }

  /**
   * Retornar objeto JSON para respuesta
   */
  toJSON() {
    return {
      error: true,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

export default AppError;
