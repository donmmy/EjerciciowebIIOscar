import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import userRoutes from './routes/user.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());

// Middlewares de parseo
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/user', userRoutes);

// Middleware de error
app.use(errorMiddleware);

export default app;
