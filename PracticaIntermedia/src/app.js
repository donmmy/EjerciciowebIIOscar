import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { generalLimiter, authLimiter } from './middleware/rateLimit.middleware.js';

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(generalLimiter);

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { 
  swaggerOptions: { url: '/api-docs.json' } 
}));

// Endpoint para obtener spec JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Rutas
app.use('/api', routes);

// Middleware de error
app.use(errorMiddleware);

export default app;
