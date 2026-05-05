import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
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

// Sanitización de datos contra inyección NoSQL
app.use(mongoSanitize());

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api', routes);

// Middleware de error
app.use(errorMiddleware);

export default app;
