# ✅ Ejercicio8 - Configuración para Railway

## Cambios Realizados para Deploy

### 🔧 Configuración de Servidor

| Archivo | Cambio |
|---------|--------|
| `src/index.js` | ✅ Completado - Inicia el servidor correctamente |
| `src/app.js` | ✅ Limpiado - Solo define la app, sin startup |
| `package.json` | ✅ Script "start" sin `--env-file` para Railway |
| `Dockerfile` | ✅ Multi-stage build + health check |
| `.dockerignore` | ✅ Optimizado para eliminar archivos innecesarios |

### 🌍 Variables de Entorno

| Variable | Local | Railway | Nota |
|----------|-------|---------|------|
| `PORT` | Desde `.env` | Automática | Railway asigna el puerto |
| `DB_URI` | Desde `.env` | - | Para desarrollo local |
| `DATABASE_URL` | - | Automática | Railway usa esto en producción |
| `JWT_SECRET` | Desde `.env` | Variable secreta | Mín 32 caracteres |
| `NODE_ENV` | `development` | `production` | Automática en Railway |
| `SLACK_WEBHOOK` | Opcional | Variable secreta | Solo si quieres notificaciones |

### 📁 Archivos Nuevos

1. **`.env.example`** - Documentación de variables
2. **`RAILWAY.md`** - Guía completa de deployment
3. **`railway.json`** - Configuración de Railway
4. **.`dockerignore`** - Optimización de imagen Docker

### 🐳 Dockerfile Mejorado

- Multi-stage build (reduce tamaño final)
- Usuario no-root (seguridad)
- Health check automático
- Optimizado para Railway

### ✨ Características para Railway

✅ **Servidor escucha en `0.0.0.0`** - Accesible desde Railway
✅ **Usa `process.env.PORT`** - Dinámico para Railway
✅ **Health check `/health`** - Railway lo detecta automáticamente
✅ **Variables de entorno flexibles** - Soporta `DATABASE_URL` (Railway) y `DB_URI` (local)
✅ **Graceful shutdown** - Manejo correcto de señales
✅ **Logs configurados** - Optimizados para Railway

## 🚀 Pasos para Deployar en Railway

### 1. Preparación
```bash
# Asegurar que todo está en git
git add .
git commit -m "Configuración para Railway"
git push
```

### 2. Crear Proyecto en Railway
- Ir a https://railway.app
- Click "New Project"
- Seleccionar "Deploy from GitHub"
- Conectar repositorio

### 3. Configurar Variables
En el dashboard de Railway:

```
PORT = 3000
NODE_ENV = production
JWT_SECRET = (generar 32 caracteres seguro)
SLACK_WEBHOOK = (opcional - https://hooks.slack.com/...)
```

### 4. Agregar MongoDB
- Click "Add Service" → "Database" → "MongoDB"
- Railway automáticamente establece `DATABASE_URL`

### 5. Deploy
- Railway detecta `Dockerfile`
- Construye y despliega automáticamente
- Accede a la URL asignada

## 📊 Estructura de Deploy

```
Railway Project
├── App Service (Node.js + Docker)
│   ├── Dockerfile
│   ├── .dockerignore
│   └── npm start
├── MongoDB Service (Automático)
│   └── DATABASE_URL (automática)
└── Variables (Secretas)
    ├── JWT_SECRET
    ├── SLACK_WEBHOOK (opcional)
    └── Otras
```

## 🔍 Validación Antes del Deploy

```bash
# Verificar que todo está en git
git status

# Probar localmente
npm install
cp .env.example .env
# (Editar .env con valores locales)
npm run dev

# Probar tests
npm test

# Construir imagen Docker localmente
docker build -t blog-api .
docker run -e PORT=3000 blog-api
```

## 📝 Arquitectura de Railway vs Local

### Local Development
```
.env (con valores locales)
  ↓
npm run dev
  ↓
node --watch --env-file=.env src/index.js
  ↓
Servidor en localhost:3000
```

### Railway Production
```
Railway Environment Variables
  ↓
npm start
  ↓
node src/index.js
  ↓
Servidor en 0.0.0.0:PORT (asignado por Railway)
  ↓
https://<railway-app>.railway.app
```

## 🔒 Seguridad

- ✅ Usuario no-root en Docker
- ✅ Variables secretas en Railway (no en .env)
- ✅ `.env` en `.gitignore` (nunca se sube)
- ✅ `.env.example` con placeholders seguros
- ✅ JWT_SECRET mínimo 32 caracteres

## 🛠️ Troubleshooting

### Error: "Cannot find module"
- Asegurar que todos los imports tienen extensión `.js`
- Verificar `"type": "module"` en package.json

### Error: "Connection refused"
- Verificar que `DATABASE_URL` es correcto
- En Railway, el servicio MongoDB tarda en iniciar

### Error: "PORT already in use"
- Railway asigna automáticamente. Usar `process.env.PORT`
- Nunca hardcodear puerto en prod

### Logs vacíos
- Ver en Railway Dashboard → Logs
- O usar: `railway logs`

## ✅ Checklist Completo

- [x] Dockerfile para Railway
- [x] .dockerignore optimizado
- [x] railway.json configurado
- [x] .env.example documentado
- [x] package.json scripts correctos
- [x] Servidor escucha en 0.0.0.0
- [x] Health check implementado
- [x] Variables de entorno flexibles
- [x] Guía de deployment (RAILWAY.md)
- [x] git ignore actualizado
- [x] Código limpio sin residuos
- [x] Tests incluidos
- [x] Documentación Swagger

## 📞 Soporte

Para más info: https://railway.app/docs
