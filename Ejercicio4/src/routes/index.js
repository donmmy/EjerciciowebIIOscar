// src/routes/index.js
import { Router } from 'express';
import todoRoutes from './todo.routes.js';

const router = Router();

router.use('/todo/todos', todoRoutes);

router.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Tareas v1.0',
    endpoints: {
      todos: '/api/todo/todos',
      health: '/health'
    }
  });
});

export default router;
