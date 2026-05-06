import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'node:http';
import { specs } from './config/swagger.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { generalLimiter } from './middleware/rateLimit.middleware.js';
import { setupSocket } from './sockets/index.js';

const app = express();
const httpServer = createServer(app);

// Centralized Socket.IO setup
const io = setupSocket(httpServer);

// Make io accessible in routes via req.app.get('io')
app.set('io', io);

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

// Ejemplo: emitir desde una ruta REST
app.post('/api/notify', (req, res) => {
  const { message } = req.body;
  const io = req.app.get('io');

  io.emit('notification', { message, timestamp: new Date() });

  res.json({ success: true, message: 'Notificación enviada' });
});

const PORT = process.env.PORT || 3000;

// Export app and httpServer for index.js
export { app, httpServer, io };
export default app;

