# T8 - Blog API con Documentación, Testing y Monitorización

Una API de Blog completa con autenticación, manejo de posts, slugs, roles (user, author, admin) y notificaciones a Slack.

## Características

- **Swagger**: Documentación interactiva en `/api-docs`
- **Blog con Posts y Slugs**: Sistema completo de blogs con URLs amigables
- **Roles**: User, Author y Admin con permisos diferenciados
- **Jest + Supertest**: Tests automatizados completos
- **Slack Webhooks**: Notificación de errores en tiempo real
- **Express 5**: Última versión de Express

## Instalación

```bash
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Endpoints

### Documentación
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api-docs` | Swagger UI |

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Registrar usuario |
| POST | `/api/auth/login` | No | Iniciar sesión |
| GET | `/api/auth/me` | Sí | Obtener perfil |
| PUT | `/api/auth/me` | Sí | Actualizar perfil |

### Posts
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/api/posts` | No | - | Listar posts publicados |
| GET | `/api/posts/:slug` | No | - | Obtener post por slug |
| GET | `/api/posts/my` | Sí | author/admin | Obtener mis posts |
| GET | `/api/posts/admin/all` | Sí | admin | Listar todos los posts |
| POST | `/api/posts` | Sí | author/admin | Crear post |
| PUT | `/api/posts/:id` | Sí | author/admin* | Actualizar post |
| PUT | `/api/posts/:id/publish` | Sí | author/admin* | Publicar/Despublicar |
| DELETE | `/api/posts/:id` | Sí | author/admin* | Eliminar post |

*Solo el autor del post o admin

### Tracks
| Método | Ruta | Auth | Rol | Descripción |
|--------|------|------|-----|-------------|
| GET | `/api/tracks` | No | - | Listar tracks |
| GET | `/api/tracks/:id` | No | - | Obtener track |
| POST | `/api/tracks` | Sí | user/admin | Crear track |
| PUT | `/api/tracks/:id` | Sí | user/admin | Actualizar track |
| DELETE | `/api/tracks/:id` | Sí | admin | Eliminar track |

## Roles

- **user**: Acceso a endpoints públicos
- **author**: Puede crear, editar y eliminar sus propios posts
- **admin**: Acceso completo a todos los endpoints

## Testing

```bash
# Ejecutar todos los tests
npm test

# Watch mode
npm run test:watch

# Cobertura
npm run test:coverage
```

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| PORT | Puerto del servidor (default: 3000) |
| DB_URI | URI de MongoDB |
| JWT_SECRET | Clave secreta para JWT |
| JWT_EXPIRES_IN | Expiración del token (default: 2h) |
| SLACK_WEBHOOK | URL del webhook de Slack |
