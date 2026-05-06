import dotenv from 'dotenv';

// Cargar archivo .env correspondiente según el ambiente
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config({ path: '.env' });
}

import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos (solo si no es test)
    if (process.env.NODE_ENV !== 'test') {
      await dbConnect();
    }

    // Iniciar servidor (solo si no es test)
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        console.log(`📚 Documentación en http://localhost:${PORT}/api-docs`);
      });
    }
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
