# Resumen de Cambios - Ejercicio8: Blog API

## 🎯 Cambios Realizados

### 1. **Actualización de Dependencias**
- ✅ Express: `4.18.2` → `5.0.0`
- ✅ Jest configurado completamente para **ESM** (módulos ES6)

### 2. **Modelo de Usuarios**
- ✅ Corregido: `mongoose.userSchema()` → `mongoose.Schema()`
- ✅ Agregado rol **"author"** junto con "user" y "admin"
- ✅ Validaciones: email único, nombre mínimo 2 caracteres, contraseña mínima 8 caracteres

### 3. **Sistema de Blog con Posts**
- ✅ Creado modelo **Post** con:
  - `slug`: URL amigable generada automáticamente del título
  - Rastreo de vistas
  - Tags y categorías
  - Estado de publicación
  - Autor vinculado
  
- ✅ Controlador **PostsController** completo con:
  - `GET /api/posts` - posts publicados (público)
  - `GET /api/posts/:slug` - obtener por slug (público, cuenta vistas)
  - `GET /api/posts/my` - posts del usuario (author/admin)
  - `GET /api/posts/admin/all` - todos los posts (admin)
  - `POST /api/posts` - crear (author/admin)
  - `PUT /api/posts/:id` - actualizar (autor/admin)
  - `DELETE /api/posts/:id` - eliminar (autor/admin)
  - `PUT /api/posts/:id/publish` - publicar/despublicar

### 4. **Autenticación Mejorada**
- ✅ Agregado `PUT /api/auth/me` para actualizar perfil de usuario
- ✅ Validación de emails duplicados en actualización
- ✅ Controlador `updateMeCtrl` completo

### 5. **Middleware de Roles**
- ✅ Actualizado `checkRol()` para aceptar:
  - Strings: `checkRol('admin')`
  - Arrays: `checkRol(['author', 'admin'])`

### 6. **Documentación Swagger**
- ✅ Cambiado de "PodcastHub API" a "Blog API"
- ✅ Schema actualizado: "Podcast" → "Post" y "UpdatePost"
- ✅ Roles actualizados: incluye "author"
- ✅ Todos los nuevos endpoints documentados

### 7. **Tests Completos**
- ✅ Creado `tests/posts.test.js` con cobertura completa:
  - Tests para GET /posts (público)
  - Tests para GET /:slug con conteo de vistas
  - Tests para GET /my (author/admin)
  - Tests para GET /admin/all (admin)
  - Tests para POST, PUT, DELETE
  - Tests de permisos (403 para roles no autorizados)
  - Tests de validación
  
- ✅ Actualizado `tests/auth.test.js`:
  - Tests para `PUT /api/auth/me`
  - Validación de emails duplicados
  - Autenticación requerida

### 8. **Limpieza de Código**
- ✅ Eliminados archivos obsoletos:
  - `models/podcast.model.js`
  - `controllers/podcasts.controller.js`
  - `routes/podcasts.routes.js`
  - `validators/podcast.validator.js`
  - `tests/podcasts.test.js`

### 9. **Documentación y Configuración**
- ✅ `README.md` actualizado con nueva estructura
- ✅ `api.http` con ejemplos completos de blog
- ✅ `jest.config.js` con configuración ESM completa

## 📋 Estructura de Roles

| Rol | GET /posts | GET /my | GET /admin/all | POST | PUT | DELETE | PUT /me |
|-----|-----------|---------|---|-----|-----|--------|---------|
| user | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| author | ✅ | ✅ | ❌ | ✅ | ✅* | ✅* | ✅ |
| admin | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*Solo sus propios posts

## 🚀 Nueva Arquitectura

```
Blog API (Express 5.0 + MongoDB)
├── Auth System
│   ├── Register/Login
│   ├── GET /me (perfil)
│   └── PUT /me (actualizar perfil)
├── Blog Posts
│   ├── GET / (público - publicados)
│   ├── GET /:slug (público - por slug)
│   ├── GET /my (author/admin - sus posts)
│   ├── GET /admin/all (admin - todos)
│   ├── POST / (author/admin - crear)
│   ├── PUT /:id (autor/admin - editar)
│   ├── DELETE /:id (autor/admin - eliminar)
│   └── PUT /:id/publish (autor/admin - publicar)
├── Tracks (mantienen su estructura)
└── Documentación Swagger + Tests Jest
```

## ✨ Características Nuevas

1. **Slugs automáticos**: Los slugs se generan del título automáticamente
2. **Rastreo de vistas**: Cada acceso a un post incrementa su contador
3. **Rol Author**: Especializado para escritores de blog
4. **Permisos granulares**: Cada endpoint tiene control de acceso específico
5. **Validación completa**: Zod para validación de datos
6. **ESM en Jest**: Configuración moderna para módulos ES6

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## 📝 Notas

- El campo `slug` es único en la base de datos
- Los slugs se actualizan automáticamente cuando cambia el título
- Las vistas se cuentan cada vez que se accede a un post por slug
- Los usuarios "user" pueden actualizar su perfil pero no crear posts
- El sistema mantiene compatibility con los endpoints existentes de Tracks
