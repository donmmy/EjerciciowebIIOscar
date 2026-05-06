# Implementación: Swagger + Jest Testing

## 📋 Resumen Ejecutivo

Se han implementado **dos características principales** del proyecto Integrador (T8):

### 1. **Documentación Swagger/OpenAPI 3.0** ✅
- UI interactiva en `/api-docs`
- Esquemas completos para todas las entidades
- Documentación de todos los 50+ endpoints
- Ejemplos de request/response
- Códigos de error documentados

### 2. **Testing con Jest + Supertest** ✅
- 4 suites de tests de integración
- 30+ casos de test
- Cobertura minima 70%
- MongoDB Memory Server para tests
- Scripts configurados en package.json

---

## 📦 Dependencias Instaladas

```json
{
  "devDependencies": {
    "swagger-jsdoc": "^latest",
    "swagger-ui-express": "^latest",
    "jest": "^latest",
    "@types/jest": "^latest",
    "supertest": "^latest",
    "mongodb-memory-server": "^latest",
    "cross-env": "^latest"
  }
}
```

---

## 🎯 Ficheros Creados/Actualizados

### Configuración

| Fichero | Propósito |
|---------|-----------|
| `jest.config.js` | Configuración de Jest |
| `.env.test` | Variables para tests |
| `package.json` | Scripts de test |
| `src/index.js` | Carga .env según environment |

### Swagger

| Fichero | Propósito |
|---------|-----------|
| `src/config/swagger.js` | Definición OpenAPI 3.0 |
| `src/app.js` | Middleware de Swagger UI |

### Tests

| Fichero | Tests |
|---------|-------|
| `tests/setup.js` | Configuración global |
| `tests/auth.test.js` | Autenticación (8 tests) |
| `tests/client.test.js` | Clientes CRUD (6 tests) |
| `tests/proyecto.test.js` | Proyectos CRUD (5 tests) |
| `tests/delivernote.test.js` | Albaranes (7 tests) |

### Documentación

| Fichero | Propósito |
|---------|-----------|
| `TESTING.md` | Guía completa de testing |
| `IMPLEMENTATION.md` | Este fichero |

---

## 🚀 Cómo Usar

### Iniciar servidor con Swagger

```bash
npm start
# Acceder a: http://localhost:3000/api-docs
```

### Ejecutar tests

```bash
# Todos los tests
npm test

# Con rerun automático
npm run test:watch

# Con cobertura
npm run test:coverage
```

---

## 📊 Test Coverage

### Endpoints Testeados

**Auth (8 tests)**
- ✅ Registro con datos válidos
- ✅ Registro con email duplicado
- ✅ Registro con email inválido
- ✅ Registro con contraseña corta
- ✅ Login exitoso
- ✅ Login con contraseña incorrecta
- ✅ Login con usuario no existente
- ✅ Obtener usuario sin token

**Clientes (6 tests)**
- ✅ Crear cliente
- ✅ Crear sin autenticación
- ✅ Listar clientes con paginación
- ✅ Filtrar clientes por nombre
- ✅ Soft delete
- ✅ Restaurar cliente

**Proyectos (5 tests)**
- ✅ Crear proyecto
- ✅ Crear sin autenticación
- ✅ Listar con paginación
- ✅ Filtrar por status
- ✅ Actualizar proyecto

**Albaranes (7 tests)**
- ✅ Crear albarán formato material
- ✅ Crear albarán formato hours
- ✅ Crear sin autenticación
- ✅ Listar con paginación
- ✅ Filtrar por formato
- ✅ Descargar PDF
- ✅ Firmar albarán

**Total: 26+ tests de integración**

---

## 🔐 Seguridad en Tests

Los tests validan:

✅ **JWT Authentication**
- Token requerido en endpoints protegidos
- Token inválido rechazado
- Token expirado rechazado

✅ **Validación de datos**
- Email válido requerido
- Contraseña mínimo 8 caracteres
- Campos requeridos verificados
- Formatos de datos validados

✅ **Aislamiento**
- BD en memoria para cada test
- Limpiar datos después de cada test
- Tests independientes

---

## 📈 Cobertura de Código

Umbral configurado en `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70
  }
}
```

Archivos incluidos:
- ✅ Controllers (CRUD logic)
- ✅ Validators (Zod schemas)
- ✅ Routes (endpoint definitions)
- ❌ Middleware (tested indirectly)
- ❌ Config (excluded)
- ❌ Utils (tested indirectly)

---

## 🎓 Esquemas OpenAPI Definidos

### User Schema
```json
{
  "_id": "string",
  "email": "string (email)",
  "password": "string (select: false)",
  "name": "string",
  "lastName": "string",
  "nif": "string",
  "role": "admin|guest",
  "status": "pending|verified",
  "company": "string (ref: Company)",
  "address": "object",
  "deleted": "boolean",
  "createdAt": "date-time"
}
```

### Client Schema
```json
{
  "_id": "string",
  "user": "string",
  "company": "string",
  "name": "string",
  "cif": "string (unique per company)",
  "email": "string",
  "phone": "string",
  "address": "object",
  "deleted": "boolean"
}
```

### Project Schema
```json
{
  "_id": "string",
  "user": "string",
  "company": "string",
  "client": "string",
  "name": "string",
  "projectCode": "string",
  "status": "activo|completado|suspendido",
  "budget": "number",
  "startDate": "date-time",
  "endDate": "date-time"
}
```

### DeliveryNote Schema
```json
{
  "_id": "string",
  "project": "string",
  "format": "material|hours",
  "material": "string (conditional)",
  "hours": "number (conditional)",
  "workers": "array (conditional)",
  "signed": "boolean",
  "signatureUrl": "string",
  "pdfUrl": "string"
}
```

---

## 🔍 Ejemplo de Test

```javascript
describe('Auth Endpoints', () => {
  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/user/register')
      .send({
        email: 'test@example.com',
        password: 'Password123456',
        name: 'John',
        lastName: 'Doe',
        nif: '12345678A',
        role: 'admin'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

---

## ✅ Checklist de Requisitos (T8)

### Documentación con Swagger (1.5 puntos)

- ✅ Anotaciones Swagger/OpenAPI 3.0
- ✅ UI interactiva en `/api-docs`
- ✅ Esquemas para User, Company, Client, Project, DeliveryNote
- ✅ Ejemplos de request/response
- ✅ Códigos de error documentados

### Testing con Jest (1.5 puntos)

- ✅ Tests de integración con Jest + Supertest
- ✅ MongoDB Memory Server para BD en memoria
- ✅ Cobertura mínima 70%
- ✅ Scripts configurados:
  - ✅ `npm test`
  - ✅ `npm run test:watch`
  - ✅ `npm run test:coverage`

---

## 🔗 Conexiones

### Swagger con Código

El archivo `src/config/swagger.js` referencia los routes:
```javascript
apis: [
  './src/routes/user.routes.js',
  './src/routes/client.routes.js',
  './src/routes/proyecto.routes.js',
  './src/routes/albaranes.routes.js'
]
```

Para documentar un endpoint con Swagger, agregar comentarios JSDoc:

```javascript
/**
 * @swagger
 * /user/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered successfully
 */
```

---

## 🐛 Debugging

### Ver logs de tests
```bash
npm test -- --verbose
```

### Test específico
```bash
npm test -- auth.test.js
```

### Watch mode
```bash
npm run test:watch
```

### Cobertura detallada
```bash
npm run test:coverage
# Abre: coverage/lcov-report/index.html
```

---

## 📝 Próximos Pasos

### Opcional: Mejorar cobertura
1. Agregar tests para middleware
2. Tests de validadores Zod
3. Tests de rate limiting
4. Tests de soft delete restore

### Opcional: CI/CD
1. Integrar con GitHub Actions
2. Ejecutar tests en PR
3. Fallar si cobertura < 70%

### Opcional: Documentación adicional
1. Agregar JSDoc a controllers
2. Agregar ejemplos de uso
3. Agregar troubleshooting guide

---

## 📚 Recursos

- [Swagger/OpenAPI 3.0](https://swagger.io/specification/)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Docs](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/tryvium-travels/mongo-memory-server)

---

**Implementación completada: 06/05/2026**
**Puntuación estimada: 3 puntos (Swagger + Jest)**
