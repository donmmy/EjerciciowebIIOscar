import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import morganBody from 'morgan-body';
import dbConnect from './config/db.js';
import routes from './routes/index.js';
import swaggerSpecs from './docs/swagger.js';
import { loggerStream } from './utils/handleLogger.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Logger para Slack (solo errores)
morganBody(app, {
  noColors: true,
  skip: (req, res) => res.statusCode < 400,
  stream: loggerStream
});

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

dbConnect().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor en http://localhost:${PORT}`);
    console.log(`📚 Docs en http://localhost:${PORT}/api-docs`);
  });
});

// src/app.js
const isProduction = process.env.NODE_ENV === 'production';

// Configurar según entorno
if (isProduction) {
  // Menos logs
  app.use(morgan('combined'));
} else {
  // Más verbose
  app.use(morgan('dev'));
}

// Error handler diferente
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    error: true,
    message: isProduction ? 'Error interno' : err.message,
    ...(isProduction ? {} : { stack: err.stack })
  });
});

app.listen(env.PORT, () => {
  console.log(`Servidor en puerto ${env.PORT} [${env.NODE_ENV}]`);
});

export default app;
