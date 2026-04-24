import app from './app.js';
import dbConnect from './config/db.js';

const PORT = process.env.PORT || 3000;

dbConnect().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor en puerto ${PORT}`);
    console.log(`📚 Docs en http://localhost:${PORT}/api-docs`);
  });
}).catch((err) => {
  console.error('❌ Error al iniciar servidor:', err.message);
  process.exit(1);
});
