# PracticaIntermedia - API de Gestión de Usuarios y Compañías

API REST segura y escalable para gestión de usuarios y compañías con autenticación JWT, roles de usuario y protección contra ataques comunes.

## 🚀 Características

### Seguridad
- ✅ **Helmet**: Protección de headers HTTP
- ✅ **JWT**: Autenticación con tokens de corta y larga duración
- ✅ **Bcrypt**: Cifrado de contraseñas
- ✅ **Rate Limiting**: Protección contra ataques de fuerza bruta
- ✅ **Sanitización NoSQL**: Prevención de inyección de datos
- ✅ **CORS**: Control de origen cruzado
- ✅ **Validación**: Validación de entrada con Zod

### Funcionalidades
- 👥 Gestión de usuarios con roles (admin, guest)
- 🏢 Gestión de compañías
- 📧 Verificación de email
- 🔄 Refresh token para mantener sesiones activas
- 📁 Carga de logos de compañía
- 🗑️ Soft delete y hard delete de usuarios
- 📊 Paginación de usuarios
- 🔐 Cambio de contraseña
- 👤 Invitación de usuarios a compañías

## 📋 Requisitos

- Node.js 16+
- npm 8+
- MongoDB 4.4+

## 📦 Instalación

### 1. Clonar o descargar el proyecto
```bash
cd PracticaIntermedia
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos
MONGODB_URI=mongodb://localhost:27017/practicaintermedia

# JWT
JWT_SECRET=tu_secreto_muy_seguro_aqui_minimo_32_caracteres
JWT_SHORT_EXPIRES_IN=15m
JWT_LONG_EXPIRES_IN=2h

# Otros
FRONTEND_URL=http://localhost:3000
```

### 4. Crear carpeta de uploads
```bash
mkdir uploads
```

### 5. Iniciar el servidor
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 🗂️ Estructura de Carpetas

```
src/
├── app.js                      # Configuración de Express
├── index.js                    # Punto de entrada
├── config/
│   └── db.js                   # Conexión a MongoDB
├── controllers/
│   └── user.controller.js      # Lógica de usuarios
├── middleware/
│   ├── error.middleware.js     # Manejo centralizado de errores
│   ├── session.middleware.js   # Validación de JWT
│   ├── rol.middleware.js       # Control de roles
│   ├── rateLimit.middleware.js # Limitación de tasa
│   ├── validate.middleware.js  # Validación de request
│   └── upload.middleware.js    # Manejo de uploads
├── models/
│   ├── user.model.js           # Schema de User
│   └── company.model.js        # Schema de Company
├── routes/
│   └── user.routes.js          # Rutas de usuario
├── schemas/
│   └── user.validator.js       # Validadores Zod
├── utils/
│   ├── AppError.js             # Clase centralizada de errores
│   ├── handleJwt.js            # Funciones JWT
│   ├── handlePassword.js       # Cifrado de contraseñas
│   └── handleError.js          # Utilidades de error
└── plugins/
    └── softDelete.plugin.js    # Plugin de soft delete

uploads/                         # Storage de archivos subidos
```

## 🔐 Autenticación

### Flujo de Login

1. **Registro de usuario**
```bash
POST /api/user/register
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "name": "Juan",
  "lastName": "Pérez",
  "nif": "12345678A"
}
```

Respuesta:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "_id": "...",
    "email": "usuario@example.com",
    "name": "Juan"
  }
}
```

2. **Login**
```bash
POST /api/user/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

3. **Usar el access token en peticiones protegidas**
```bash
GET /api/user
Authorization: Bearer ACCESS_TOKEN
```

4. **Refrescar token cuando expira (15 minutos)**
```bash
POST /api/user/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

## 📡 Endpoints API

### Autenticación
| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|-------------|
| POST | `/api/user/register` | Registrar nuevo usuario | ❌ |
| POST | `/api/user/login` | Iniciar sesión | ❌ |
| POST | `/api/user/refresh` | Refrescar access token | ❌ |
| POST | `/api/user/logout` | Cerrar sesión | ✅ |

### Gestión de Usuarios
| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|-------------|
| GET | `/api/user` | Obtener usuario autenticado | ✅ |
| GET | `/api/user/:id` | Obtener usuario por ID | ✅ |
| GET | `/api/user?page=1&limit=10&role=admin` | Listar usuarios con paginación | ✅ |
| PUT | `/api/user/register` | Actualizar datos personales | ✅ |
| PUT | `/api/user/validation` | Validar código de email | ✅ |
| DELETE | `/api/user/:id` | Eliminar usuario | ✅ (solo admin) |
| PUT | `/api/user/password` | Cambiar contraseña | ✅ |

### Gestión de Compañías
| Método | Endpoint | Descripción | Autenticado |
|--------|----------|-------------|-------------|
| PATCH | `/api/user/company` | Asignar/crear compañía | ✅ |
| PATCH | `/api/user/logo` | Cargar logo de compañía | ✅ |

### Usuarios (Admin)
| Método | Endpoint | Descripción | Autenticado | Rol |
|--------|----------|-------------|-------------|-----|
| POST | `/api/user/invite` | Invitar usuario a compañía | ✅ | admin |

## 🔑 Roles y Permisos

### Roles disponibles
- **admin**: Propietario de la compañía o administrador del sistema
  - Puede gestionar usuarios
  - Puede invitar usuarios
  - Acceso completo a recursos de la compañía

- **guest**: Miembro de la compañía
  - Acceso limitado a recursos
  - No puede gestionar otros usuarios

## 🛡️ Medidas de Seguridad Implementadas

### 1. Validación de Entrada
```javascript
// Todos los endpoints validan entrada con Zod
POST /api/user/register
- email: string requerido y válido
- password: mínimo 8 caracteres
- name: respuesta de 2-100 caracteres
```

### 2. Rate Limiting
- **General**: 100 solicitudes / 15 minutos
- **Autenticación**: 5 intentos fallidos / 15 minutos
- **Escritura**: 30 solicitudes / 15 minutos

### 3. Sanitización NoSQL
```javascript
// Previene ataques como:
{
  "email": {"$ne": null},  // Se elimina el operador $
  "password": {"$gt": ""}   // Se elimina el operador $gt
}
```

### 4. Tokens JWT
- **Access Token**: 15 minutos (alta seguridad)
- **Refresh Token**: 2 horas (renovación de sesión)
- Contenido: `{ userId, iat, exp }`

### 5. Cifrado de Contraseñas
```javascript
// Usar bcryptjs con 10 salt rounds
const hashedPassword = await encrypt(password);
```

### 6. Errores Consistentes
```json
{
  "error": true,
  "statusCode": 400,
  "message": "Descripción del error",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📊 Índices de Base de Datos

Para mejor rendimiento, se crearon índices en:
- `email` (único)
- `status`
- `role`
- `company`
- `createdAt`
- `nif`
- Índices compuestos para búsquedas comunes

## 🧪 Validación de Datos

Todos los endpoints validan datos usando Zod schemas:

```javascript
// Registro
{
  email: String (validación email),
  password: String (min 8 caracteres),
  name: String (min 2, max 100),
  lastName: String,
  nif: String (8-12 caracteres)
}

// Login
{
  email: String,
  password: String
}

// Cambio de compañía
{
  name: String,
  cif: String,
  address?: String,
  isFreelance?: Boolean
}
```

## 🚨 Respuestas de Error Comunes

```json
// Validación fallida (400)
{
  "error": true,
  "statusCode": 400,
  "message": "Email inválido"
}

// No autorizado (401)
{
  "error": true,
  "statusCode": 401,
  "message": "Token inválido o expirado"
}

// Prohibido (403)
{
  "error": true,
  "statusCode": 403,
  "message": "No tienes permiso para acceder a este recurso"
}

// Conflicto (409)
{
  "error": true,
  "statusCode": 409,
  "message": "Email ya registrado"
}

// Demasiadas solicitudes (429)
{
  "error": true,
  "statusCode": 429,
  "message": "Demasiadas solicitudes, intenta más tarde"
}
```

## 🔄 Flujo de Desarrollo

### Desarrollo
```bash
npm start
```

### Testing
```bash
npm test
```

### Compilación/Build
```bash
npm run build
```

## 📚 Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|----------|
| Express | 5.2.1 | Framework web |
| MongoDB | 7.1.1+ | Base de datos |
| Mongoose | 8.0.0 | ODM para MongoDB |
| JWT | 9.0.3 | Autenticación |
| Bcryptjs | 3.0.3 | Cifrado de contraseñas |
| Helmet | 8.1.0 | Seguridad HTTP |
| express-rate-limit | 8.3.2 | Limitación de tasa |
| express-mongo-sanitize | 2.2.0 | Sanitización NoSQL |
| Zod | 4.3.6 | Validación de esquemas |
| Multer | 1.4.5 | Carga de archivos |
| Dotenv | 16.0.3 | Variables de entorno |
| CORS | 2.8.6 | Control de origen |

## 📖 Documentación Adicional

### Clase AppError
```javascript
import { AppError } from './utils/AppError.js';

// Usar métodos factoría
throw AppError.badRequest('Mensaje de error');
throw AppError.unauthorized('No autorizado');
throw AppError.forbidden('Prohibido');
throw AppError.notFound('No encontrado');
throw AppError.conflict('Conflicto');
throw AppError.tooManyRequests('Demasiadas solicitudes');
```

### Middleware de Roles
```javascript
import { isAdmin, checkRoles } from './middleware/rol.middleware.js';

// Solo admin
router.delete('/user/:id', authMiddleware, isAdmin, deleteUser);

// Múltiples roles
router.post('/invite', authMiddleware, checkRoles(['admin', 'owner']), inviteUser);
```

## 🤝 Contribuir

Para contribuir al proyecto:

1. Hacer fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Hacer commit de los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Hacer push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia ISC.

## 👨‍💻 Autor

Desarrollado como parte de una práctica intermedia de desarrollo web full-stack.

## 📞 Soporte

Para reportar bugs o solicitar funcionalidades, por favor abrir un issue en el repositorio.

## ✅ Checklist de Seguridad

- [x] Helmet configurado
- [x] CORS habilitado
- [x] Rate limiting implementado
- [x] JWT con tokens cortos y largos
- [x] Bcrypt para contraseñas
- [x] Sanitización NoSQL
- [x] Validación de entrada con Zod
- [x] Índices de base de datos optimizados
- [x] Manejo centralizado de errores
- [x] Middleware de autenticación
- [x] Control de roles
- [x] Soft delete implementado
- [x] Paginación en listados
- [x] Carga segura de archivos

---

**Última actualización**: Abril 2024

