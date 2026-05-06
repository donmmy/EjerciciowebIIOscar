export const validateRequest = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (error) {
    // Manejar errores de Zod
    if (error.errors && Array.isArray(error.errors)) {
      const errors = error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));

      return res.status(400).json({
        error: true,
        message: 'Error de validación',
        details: errors
      });
    }

    // Manejar otros errores
    return res.status(400).json({
      error: true,
      message: error.message || 'Error de validación',
      details: []
    });
  }
};
