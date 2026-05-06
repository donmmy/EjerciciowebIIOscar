# Testing & Documentation

## Swagger API Documentation

La API está completamente documentada con Swagger/OpenAPI 3.0.

### Acceder a la documentación interactiva

```bash
npm start
# Luego abre: http://localhost:3000/api-docs
```

### Características

✅ **Esquemas definidos** para:
- User (Usuarios con autenticación JWT)
- Company (Empresas propietarias)
- Client (Clientes)
- Project (Proyectos)
- DeliveryNote (Albaranes)

✅ **Documentación de endpoints** con:
- Descripción clara de cada operación
- Parámetros requeridos y opcionales
- Ejemplos de request/response
- Códigos de error posibles

✅ **Autenticación JWT**:
- Usa Bearer token en header `Authorization`
- Genera automáticamente en registro/login
- Expira en 15 minutos (acceso) o 2 horas (refresco)

---

## Testing con Jest

### Configuración

Los tests usan:
- **Jest** - Framework de testing
- **Supertest** - HTTP assertions
- **MongoDB Memory Server** - BD en memoria para tests

### Ejecutar tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch (rerun on changes)
npm run test:watch

# Cobertura de código
npm run test:coverage
```

### Test Coverage

Objetivo: **70% de cobertura** (branches, functions, lines, statements)

Archivos testeados:
- ✅ `tests/auth.test.js` - Endpoints de autenticación
- ✅ `tests/client.test.js` - CRUD de clientes
- ✅ `tests/proyecto.test.js` - CRUD de proyectos
- ✅ `tests/delivernote.test.js` - Gestión de albaranes

### Ejemplos de Tests

**Test de registro:**
```javascript
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
});
```

**Test de autenticación:**
```javascript
it('should fail without token', async () => {
  const response = await request(app)
    .get('/api/user');

  expect(response.status).toBe(401);
});
```

**Test de CRUD:**
```javascript
it('should create a new client', async () => {
  const response = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Client',
      cif: 'B87654321'
    });

  expect(response.status).toBe(200);
  expect(response.body.name).toBe('Test Client');
});
```

### Base de Datos para Tests

Los tests usan **MongoDB Memory Server** que crea una BD en memoria:

```javascript
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
```

Esto garantiza que:
- Los tests no afecten la BD de producción
- Cada test es independiente
- Los tests corren rápido

---

## Estructura de Tests

```
tests/
├── setup.js              # Configuración inicial
├── auth.test.js          # Tests de autenticación
├── client.test.js        # Tests de clientes
├── proyecto.test.js      # Tests de proyectos
└── delivernote.test.js   # Tests de albaranes
```

### Hooks de Jest

```javascript
beforeAll()   // Se ejecuta una vez antes de todos los tests
afterAll()    // Se ejecuta una vez después de todos los tests
beforeEach()  // Se ejecuta antes de cada test
afterEach()   // Se ejecuta después de cada test
```

---

## Endpoints Documentados

### Autenticación (sin JWT)

- `POST /api/user/register` - Registrar usuario
- `POST /api/user/login` - Login
- `POST /api/user/refresh` - Refrescar token

### Usuarios (requieren JWT)

- `GET /api/user` - Obtener usuario autenticado
- `PUT /api/user/register` - Actualizar datos
- `PATCH /api/user/company` - Asignar compañía
- `PATCH /api/user/logo` - Subir logo
- `POST /api/user/change-password` - Cambiar contraseña
- `DELETE /api/user` - Eliminar usuario
- `GET /api/user/list` - Listar usuarios (admin)

### Clientes (requieren JWT)

- `POST /api/client` - Crear cliente
- `GET /api/client` - Listar clientes
- `GET /api/client/:id` - Obtener cliente
- `PATCH /api/client/:id` - Actualizar cliente
- `DELETE /api/client/:id` - Eliminar cliente
- `GET /api/client/archived` - Ver eliminados
- `PATCH /api/client/:id/restore` - Restaurar

### Proyectos (requieren JWT)

- `POST /api/project` - Crear proyecto
- `GET /api/project` - Listar proyectos
- `GET /api/project/:id` - Obtener proyecto
- `PATCH /api/project/:id` - Actualizar proyecto
- `DELETE /api/project/:id` - Eliminar proyecto
- `GET /api/project/archived` - Ver eliminados

### Albaranes (requieren JWT)

- `POST /api/deliverynote` - Crear albarán
- `GET /api/deliverynote` - Listar albaranes
- `GET /api/deliverynote/:id` - Obtener albarán
- `GET /api/deliverynote/pdf/:id` - Descargar PDF
- `PATCH /api/deliverynote/:id/sign` - Firmar (multipart)
- `DELETE /api/deliverynote/:id` - Eliminar

---

## Códigos de Error

| Código | Tipo | Descripción |
|--------|------|-------------|
| 200 | OK | Operación exitosa |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | Token inválido o ausente |
| 403 | Forbidden | Permiso denegado |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email/CIF duplicado |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## CI/CD Integration

Para integrar con GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

---

## Debugging Tests

### Ver detalles de test fallido

```bash
npm test -- --verbose
```

### Ejecutar un test específico

```bash
npm test -- auth.test.js
```

### Ver logs durante tests

Editar `tests/setup.js` y comentar:
```javascript
// global.console.log = jest.fn();
```

---

## Próximas mejoras

- ⏳ Mock de Cloudinary para tests de upload
- ⏳ Tests de validadores Zod
- ⏳ Tests de middlewares de seguridad
- ⏳ Performance testing
