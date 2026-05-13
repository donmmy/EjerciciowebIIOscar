# 🚀 Guía de Nuevas Características

Este documento proporciona una guía completa sobre las 3 nuevas características implementadas:
1. **WebSockets en Tiempo Real**
2. **Notificaciones por Email**
3. **Logging a Slack**

---

## 1. WebSockets en Tiempo Real (Socket.IO)

### ¿Qué es?
Los WebSockets permiten comunicación bidireccional en tiempo real entre el servidor y los clientes. Cuando ocurren eventos (crear cliente, proyecto, firmar albarán), todos los usuarios conectados a la misma compañía reciben notificaciones instantáneas.

### Instalación
```bash
npm install socket.io socket.io-client
```

### Configuración

**En `src/app.js`:**
```javascript
import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);
```

### Eventos Disponibles

#### Clientes
- `client:new` - Nuevo cliente creado
- `client:modified` - Cliente actualizado
- `client:removed` - Cliente eliminado

#### Proyectos
- `project:new` - Nuevo proyecto creado
- `project:modified` - Proyecto actualizado
- `project:completed` - Proyecto completado

#### Albaranes
- `deliverynote:new` - Nuevo albarán
- `deliverynote:signed` - Albarán firmado
- `deliverynote:removed` - Albarán eliminado

### Uso en el Cliente (JavaScript)

```javascript
// Conectar
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: accessToken,
    userId: userId,
    companyId: companyId
  }
});

// Escuchar eventos
socket.on('client:new', (data) => {
  console.log('Nuevo cliente:', data);
  // Actualizar UI
});

socket.on('project:completed', (data) => {
  console.log('Proyecto completado:', data);
  // Mostrar notificación
});

socket.on('deliverynote:signed', (data) => {
  console.log('Albarán firmado:', data);
  // Actualizar lista
});

// Desconectar
socket.disconnect();
```

### Salas (Rooms)

Los usuarios se unen automáticamente a 2 salas:
- `company:{companyId}` - Broadcast a toda la compañía
- `user:{userId}` - Broadcast a usuario específico

### Funciones de Servicio

```javascript
import { broadcastToCompany, broadcastToUser } from './services/websocket.service.js';

// Enviar a toda la compañía
broadcastToCompany(io, companyId, 'event:name', { data });

// Enviar a usuario específico
broadcastToUser(io, userId, 'event:name', { data });
```

---

## 2. Notificaciones por Email

### ¿Qué es?
Sistema de envío de emails automáticos para eventos importantes: bienvenida, verificación, recuperación de contraseña, albarán firmado, proyecto completado.

### Instalación
```bash
npm install nodemailer
```

### Configuración

**Variables de entorno (.env):**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_contraseña_app
EMAIL_FROM=noreply@practica.com
```

**Para Gmail App Password:**
1. Ir a https://myaccount.google.com/security
2. Activar autenticación de 2 factores
3. Generar "App Password" para Gmail
4. Usar ese password en `EMAIL_PASSWORD`

### Funciones Disponibles

#### 1. sendWelcomeEmail
```javascript
import { sendWelcomeEmail } from './utils/handleEmail.js';

await sendWelcomeEmail(email, name);
// Envía email de bienvenida con funcionalidades disponibles
```

#### 2. sendVerificationCodeEmail
```javascript
await sendVerificationCodeEmail(email, verificationCode);
// Envía código de verificación de 6 dígitos
```

#### 3. sendPasswordRecoveryEmail
```javascript
await sendPasswordRecoveryEmail(email, name, resetLink);
// Envía enlace para recuperar contraseña
```

#### 4. sendDeliveryNoteSigned
```javascript
await sendDeliveryNoteSigned(email, clientName, deliveryNoteId);
// Notifica que albarán fue firmado
```

#### 5. sendProjectCompletedEmail
```javascript
await sendProjectCompletedEmail(email, projectName, projectId);
// Notifica que proyecto fue completado
```

### Integración en Controladores

**user.controller.js:**
```javascript
export const registerCtrl = async (req, res, next) => {
  // ... crear usuario ...
  
  // Enviar emails
  await sendWelcomeEmail(dataUser.email, dataUser.name);
  await sendVerificationCodeEmail(dataUser.email, verificationCode);
  
  res.status(201).send(data);
};
```

**proyecto.controller.js:**
```javascript
export const updateProyecto = async (req, res, next) => {
  // ... actualizar proyecto ...
  
  if (status === 'completado') {
    await sendProjectCompletedEmail(req.user.email, updatedProyecto.name, updatedProyecto._id);
  }
  
  res.status(200).json(updatedProyecto);
};
```

**albaranes.controller.js:**
```javascript
export const signDeliverNote = async (req, res, next) => {
  // ... firmar albarán ...
  
  await sendDeliveryNoteSigned(req.user.email, deliverNote.client?.name, deliverNote._id);
  
  res.json({ message: 'Albarán firmado correctamente' });
};
```

### Prueba de Emails

En desarrollo, puedes usar [Mailtrap](https://mailtrap.io) o similar para capturar emails sin enviarlos realmente:

```
EMAIL_HOST=live.smtp.mailtrap.io
EMAIL_PORT=465
EMAIL_USER=tu_mailtrap_user
EMAIL_PASSWORD=tu_mailtrap_password
```

---

## 3. Logging a Slack

### ¿Qué es?
Sistema de logging que registra eventos importantes en archivos locales y envía notificaciones a Slack en tiempo real. Facilita monitoreo de actividades y debugging.

### Instalación
```bash
npm install winston @slack/web-api
```

### Configuración

**Variables de entorno (.env):**
```
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_BOT_TOKEN=xoxb-your-token-here
LOG_LEVEL=debug
LOG_DIR=./logs
```

**Obtener Slack Webhook:**
1. Ir a https://api.slack.com/apps
2. Create New App → From scratch
3. Enable Incoming Webhooks
4. Add New Webhook to Workspace
5. Copiar URL

### Funciones de Logging

#### logUserRegistered
```javascript
import { logUserRegistered } from './utils/handleLogger.js';

await logUserRegistered(user);
// Registra: "🎉 Nuevo usuario registrado: John Doe (john@example.com)"
```

#### logClientCreated
```javascript
import { logClientCreated } from './utils/handleLogger.js';

await logClientCreated(client);
// Registra: "👤 Nuevo cliente: Acme Corp (B12345678)"
```

#### logProjectCreated
```javascript
import { logProjectCreated } from './utils/handleLogger.js';

await logProjectCreated(project);
// Registra: "📋 Nuevo proyecto: Website Redesign ($50000)"
```

#### logProjectCompleted
```javascript
import { logProjectCompleted } from './utils/handleLogger.js';

await logProjectCompleted(project);
// Registra: "✅ Proyecto \"Website Redesign\" completado"
```

#### logDeliveryNoteSigned
```javascript
import { logDeliveryNoteSigned } from './utils/handleLogger.js';

await logDeliveryNoteSigned(deliveryNote, signedBy);
// Registra: "📄 Albarán #507f1f77bcf86cd799439011 firmado por John Doe"
```

#### logCriticalError
```javascript
import { logCriticalError } from './utils/handleLogger.js';

await logCriticalError(error, { userId, action: 'createProject' });
// Registra errores críticos con contexto
```

#### logRateLimitExceeded
```javascript
import { logRateLimitExceeded } from './utils/handleLogger.js';

await logRateLimitExceeded(ip, endpoint);
// Registra: "⚠️ Rate limit excedido desde 192.168.1.1 en /api/project"
```

### Integración en Controladores

```javascript
import { logClientCreated, logProjectCreated } from './utils/handleLogger.js';

export const createClient = async (req, res, next) => {
  try {
    const newClient = await Client.create({...});
    await logClientCreated(newClient);  // ← Agregar esto
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
};
```

### Archivos de Log

Los logs se guardan en `./logs/`:
- `error.log` - Solo errores
- `combined.log` - Todos los logs
- `test/` - Logs de pruebas

### Niveles de Log

- `error` - Solo errores
- `warn` - Advertencias y errores
- `info` - Información general (default)
- `debug` - Detalles de debugging
- `silly` - Todo

Cambiar nivel en `.env`:
```
LOG_LEVEL=debug  # más verboso
LOG_LEVEL=error  # menos verboso
```

---

## 4. Integración Completa

### Flujo de Ejemplo: Crear Cliente

1. Cliente envía POST /api/client
2. **Controller** crea el cliente en BD
3. **Logging**: `await logClientCreated(newClient)` → Envía a Slack y archivo
4. **WebSocket**: `broadcastToCompany(io, companyId, 'client:new', {...})` → Notifica otros usuarios
5. Responder al cliente

```javascript
export const createClient = async (req, res, next) => {
  try {
    const newClient = await Client.create({...});
    
    // Log a Slack
    await logClientCreated(newClient);
    
    // Broadcast WebSocket
    const io = req.app.get('io');
    if (io) {
      broadcastToCompany(io, companyId, 'client:new', {
        id: newClient._id,
        name: newClient.name,
        cif: newClient.cif
      });
    }
    
    res.status(201).json(newClient);
  } catch (error) {
    next(error);
  }
};
```

---

## 5. Testing

### Deshabilitar Emails en Tests
```javascript
// handleEmail.js - Chequear si es test
if (process.env.NODE_ENV === 'test') {
  return; // No enviar emails
}
```

### Deshabilitar Slack en Tests
```javascript
// handleLogger.js - Usa variable de entorno
const webhook = process.env.SLACK_WEBHOOK_URL
  ? new IncomingWebhook(process.env.SLACK_WEBHOOK_URL)
  : null;
```

### Mock de WebSocket en Tests
```javascript
// No necesita, Socket.IO se auto-deshabilita sin conexión
```

---

## 6. Troubleshooting

### "Cannot set property io of #<Object>"
**Problema**: Socket.IO no inicializado
**Solución**: Asegurar que `app.set('io', io)` está en app.js

### "Email not sent"
**Problema**: Credenciales incorrectas
**Solución**: 
- Verificar `EMAIL_USER` y `EMAIL_PASSWORD` en .env
- Para Gmail, usar App Password (no contraseña normal)
- Habilitar "Less Secure Apps" si es necesario

### "Slack webhook error"
**Problema**: URL inválida
**Solución**: Regenerar webhook en https://api.slack.com/apps

### "Socket connection failed"
**Problema**: CORS o auth incorrecta
**Solución**: Verificar `auth` en cliente y `CORS_ORIGIN` en servidor

---

## 7. Monitoreo

### Ver Logs en Tiempo Real
```bash
tail -f logs/combined.log
```

### Estadísticas de Eventos
```bash
grep "client:new" logs/combined.log | wc -l
```

### Búsqueda de Errores
```bash
grep "error" logs/error.log
```

---

## Resumen

| Característica | Función | Evento |
|---|---|---|
| **WebSockets** | Notificaciones en tiempo real | client:new, project:completed, deliverynote:signed |
| **Email** | Notificaciones persistentes | Welcome, Verification, ProjectCompleted, Signed |
| **Slack** | Monitoreo centralizado | UserRegistered, ClientCreated, ProjectCompleted |

✅ Las 3 características están completamente integradas y listas para producción.
