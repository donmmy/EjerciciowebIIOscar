import 'dotenv/config';
import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a la base de datos
    await dbConnect();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

startServer();
