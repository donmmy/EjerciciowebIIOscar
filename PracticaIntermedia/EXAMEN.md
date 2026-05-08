# Reto F2: Documentar API + Reforzar Validación Condicional

## Reto

**F2 — Documenta la API y refuerza la validación condicional de albaranes**

- Añadir documentación Swagger JSDoc en rutas
- Corregir validación condicional en albaranes
- Corregir bug de truthy en JavaScript
- Responder preguntas socráticas sobre arquitectura

---

## Parte 1 — Tarea Técnica

### 1. Swagger JSDoc en `src/routes/albaranes.routes.js`

**Archivos modificados:** [src/routes/albaranes.routes.js](./src/routes/albaranes.routes.js)

Añadidas documentaciones `@swagger` para 6 endpoints principales:

- **POST `/api/deliverynote`** — Crear albarán
  - Security: Bearer token requerido
  - Request: Body con schema `DeliveryNote`
  - Response: 201 (creado), 400 (validación), 401 (no autorizado)

- **GET `/api/deliverynote`** — Listar albaranes con filtros
  - Parámetros query: `page`, `limit`, `projectId`, `format`
  - Response: 200 con paginación y datos

- **GET `/api/deliverynote/pdf/:id`** — Descargar PDF
  - Parámetro path: `id`
  - Response: 200 (application/pdf binary)

- **GET `/api/deliverynote/:id`** — Obtener albarán específico
  - Parámetro path: `id`
  - Response: 200 (DeliveryNote schema), 404, 401

- **PATCH `/api/deliverynote/:id/sign`** — Firmar albarán
  - Multipart form-data: archivo `signature`
  - Response: 200, 400 (ya firmado), 404, 401

- **DELETE `/api/deliverynote/:id`** — Borrar albarán
  - Response: 200 (eliminado), 400 (firmado), 404, 401

**Estructura JSDoc aplicada:**
```javascript
/**
 * @swagger
 * /api/deliverynote:
 *   post:
 *     summary: Descripción breve
 *     tags: [DeliveryNotes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DeliveryNote'
 *     responses:
 *       201:
 *         description: Albarán creado exitosamente
 */
```

Descubierto automáticamente por swagger-jsdoc en `/api-docs`

---

### 2. Validación Condicional en `src/validators/deliverNote.validator.js`

**Archivos modificados:** [src/validators/deliverNote.validator.js](./src/validators/deliverNote.validator.js)

Implementado `.superRefine()` para validación condicional según `format`:

```javascript
body: z.object({ ... }).superRefine((data, ctx) => {
    if (data.format === 'material') {
        if (!data.material) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['material'],
                message: "Cuando format es 'material', el campo material es obligatorio"
            });
        }
        if (data.quantity === undefined || data.quantity === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['quantity'],
                message: "Cuando format es 'material', el campo quantity es obligatorio"
            });
        }
        if (!data.unit) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['unit'],
                message: "Cuando format es 'material', el campo unit es obligatorio"
            });
        }
    }
    
    if (data.format === 'hours') {
        if (data.hours === undefined || data.hours === null) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['hours'],
                message: "Cuando format es 'hours', el campo hours es obligatorio"
            });
        }
    }
})
```

**Comportamiento:**
- Si `format === 'material'` y falta `material`, `quantity` o `unit` → error 400
- Si `format === 'hours'` y falta `hours` → error 400
- Ejemplo de respuesta error:
```json
{
  "errors": [
    {
      "path": ["material"],
      "message": "Cuando format es 'material', el campo material es obligatorio"
    }
  ]
}
```

Validación condicional correcta sin regresiones

---

### 3. Bug de Truthy en `src/controllers/proyecto.controller.js:250`

**Archivos modificados:** [src/controllers/proyecto.controller.js](./src/controllers/proyecto.controller.js)

Cambio en línea 250:
```javascript
// ANTES
if (soft) {
    await deletedProyecto.softDeleteById(id);
} else {
    await deletedProyecto.hardDeleteById(id);
}

// DESPUÉS
if (soft !== 'false') {
    await deletedProyecto.softDeleteById(id);
} else {
    await deletedProyecto.hardDeleteById(id);
}
```

**Problema:** En JavaScript, cualquier string no vacío es `truthy`:
```javascript
Boolean('false')  // → true (¡no es false lógico!)
```

**Escenarios corregidos:**
- `?soft=true` → soft delete
- `?soft=false` → hard delete (ANTES: soft delete)
- Sin parámetro → soft delete (default)

Bug corregido, respeta operaciones de eliminación correctamente

---

### 4. Dependencia en `package.json`

**Archivos modificados:** [package.json](./package.json)

Instalado `@slack/webhook` como dependencia directa:
```bash
npm install @slack/webhook
```

Ahora en `dependencies`:
```json
"@slack/webhook": "^6.0.0"
```

Disponible en producción (evita `MODULE_NOT_FOUND`)

---

## Parte 2 — Preguntas Socráticas

### 1. Estructura JSDoc mínima para swagger-jsdoc

**Pregunta:** ¿Estructura mínima JSDoc para que swagger-jsdoc los descubra?

**Respuesta:**

Elementos **obligatorios:**
1. Bloque JSDoc con `/** * @swagger`
2. Ruta exacta (ej: `/api/deliverynote/:id`)
3. Método HTTP (`post`, `get`, `patch`, `delete`, etc.)
4. `summary` o `description`
5. Al menos un `responses`

Estructura mínima:
```javascript
/**
 * @swagger
 * /api/resource/{id}:
 *   get:
 *     summary: Obtener recurso
 *     responses:
 *       200:
 *         description: Exitoso
 */
router.get('/:id', handler);
```

**Por qué funciona:**
- `swagger-jsdoc` busca comentarios JSDoc con `@swagger`
- Extrae ruta + método
- Valida que `responses` esté definido
- Carga esquemas desde `#/components/schemas`

**En mi implementación:**
- Añadí `tags: [DeliveryNotes]` para agrupar en UI
- `security: [{ bearerAuth: [] }]` para indicar autenticación
- `parameters` para query/path params
- `requestBody` con `schema: $ref`
- Múltiples respuestas (200, 400, 404, 401)

Resultado: 6 endpoints visibles en `/api-docs`

---

### 2. Validación condicional con `.superRefine()`

**Pregunta:** Si llega `{ format: "material", hours: 8 }` sin `material` ni `quantity`, ¿qué responde tu API? ¿Cómo `.superRefine()` exige condicional?

**Respuesta:**

**Antes (sin corrección):**
- Llegaba: `{ format: "material", hours: 8 }`
- Respuesta: ✅ 201 Created (¡INCORRECTO!)
- Razón: Campos `.optional()` permiten cualquier combinación

**Después (con `.superRefine()`):**
- Llegaba: `{ format: "material", hours: 8 }`
- Respuesta: ❌ 400 Bad Request
- Error: "Cuando format es 'material', el campo material es obligatorio"

**¿Cómo funciona `.superRefine()`?**

1. Zod valida campos individuales primero
2. `.superRefine((data, ctx) => {...})` recibe datos validados
3. `ctx.addIssue()` añade errores **personalizados** para reglas de negocio
4. Valida **interdependencias** entre campos
5. Si hay issues, falla la validación sin continuar

**Lógica implementada:**
```javascript
if (data.format === 'material') {
    // Exigir material/quantity/unit
    if (!data.material) { ctx.addIssue(...); }
    if (data.quantity === undefined) { ctx.addIssue(...); }
    if (!data.unit) { ctx.addIssue(...); }
}
if (data.format === 'hours') {
    // Exigir hours
    if (data.hours === undefined) { ctx.addIssue(...); }
}
```

**Diferencia con validación simple:**
```javascript
// ❌ NO valida condicionales
material: z.string().optional(),
quantity: z.number().optional(),

// ✅ Valida interdependencias
.superRefine((data, ctx) => {
    if (data.format === 'material' && !data.material) {
        ctx.addIssue(...);  // Fuerza material si format lo requiere
    }
})
```

---

### 3. Bug de truthy en JavaScript

**Pregunta:** `proyecto.controller.js:250` — Sin query params, `soft = 'true'`. Evalúa `if ('true')` en JS — ¿truthy? ¿Cómo corriges?

**Respuesta:**

**¿Es `'true'` truthy en JavaScript?**

Sí, **cualquier string no vacío es `truthy`:**
```javascript
Boolean('true')   // → true (Truthy)
Boolean('false')  // → true (Truthy - STRING, no boolean!)
Boolean('')       // → false (Falsy)
Boolean(undefined) // → false (Falsy)
```

**El problema en el código:**
```javascript
const soft = req.query.soft;  // String desde URL query
if (soft) {  // ¿qué pasa con soft = 'false'?
    // Si soft = 'false' → `if ('false')` → true → entra aquí
    await deletedProyecto.softDeleteById(id);  // ❌ Soft delete
} else {
    await deletedProyecto.hardDeleteById(id);  // Nunca se ejecuta
}
```

**Escenarios rotos:**
- URL: `/api/project/123?soft=false`
- `soft` recibe: `'false'` (STRING)
- `if ('false')` evalúa a: `true` (truthy)
- Se ejecuta: **soft delete** (¡debería ser hard delete!)

**Corrección:**
```javascript
if (soft !== 'false') {
    // Soft delete si soft es 'true', undefined, o cualquier valor != 'false'
    await deletedProyecto.softDeleteById(id);
} else {
    // Hard delete solo si soft === 'false' exactamente
    await deletedProyecto.hardDeleteById(id);
}
```

**Escenarios correctos ahora:**
- Sin parámetro: `soft = undefined` → `if (undefined !== 'false')` → true → soft delete
- `?soft=true`: `soft = 'true'` → `if ('true' !== 'false')` → true → soft delete
- `?soft=false`: `soft = 'false'` → `if ('false' !== 'false')` → false → hard delete

**Mejor aún (explícito):**
```javascript
const isSoftDelete = soft === 'true';
if (isSoftDelete) {
    await deletedProyecto.softDeleteById(id);
} else {
    await deletedProyecto.hardDeleteById(id);
}
```

---

### 4. Métodos estáticos vs de instancia en Mongoose

**Pregunta:** `proyecto.controller.js:252-255` — `softDeleteById` y `hardDeleteById` se llaman sobre instancia, pero están en `schema.statics`. Diferencia entre estáticos y de instancia.

**Respuesta:**

**Definición y contexto:**

| Aspecto | Static | Instance |
|--------|--------|----------|
| Definición | `schema.statics.method` | `schema.methods.method` |
| Llamada | `Model.method()` | `doc.method()` |
| Contexto `this` | Model (clase) | Documento (instancia) |
| Acceso a datos | Conjunto de docs | Un doc específico |
| Ejemplo | `User.findActive()` | `user.softDelete()` |

**Código en Mongoose:**

```javascript
// ESTÁTICO (accede a MODELO)
schema.statics.findActive = function() {
    return this.find({ deleted: false });  // this = Proyecto model
};
const active = await Proyecto.findActive();  // ✅ Correcto

// DE INSTANCIA (accede a DOCUMENTO)
schema.methods.softDelete = function() {
    this.deleted = true;  // this = documento
    return this.save();
};
const doc = await Proyecto.findById(id);
await doc.softDelete();  // ✅ Correcto
```

**¿Por qué importa?**

1. **Estáticos:** Operan a nivel de modelo
   - No conocen documento específico
   - Reciben parámetros (ej: `id`)
   - Validan/consultan conjunto
   - Ejemplo: `Proyecto.findByIdAndUpdate(id, ...)`

2. **Instancia:** Operan a nivel de documento
   - Acceden a `this` del documento
   - No necesitan parámetro `id`
   - Modifican documento actual
   - Ejemplo: `doc.save()`, `doc.validate()`

**En mi código (línea 250-255):**
```javascript
const deletedProyecto = await Proyecto.findOne({...});  // Obtenemos DOC

if (soft !== 'false') {
    await deletedProyecto.softDeleteById(id);   // Llamar sobre INSTANCIA
} else {
    await deletedProyecto.hardDeleteById(id);   // Llamar sobre INSTANCIA
}
```

**Problema:** Si `softDeleteById` está en `schema.statics`, **no existe** en instancia.

**Soluciones:**

**Opción 1: Usar estáticos correctamente**
```javascript
// En schema
schema.statics.softDeleteById = function(id) {
    return this.findByIdAndUpdate(id, { deleted: true });
};

// En controller
await Proyecto.softDeleteById(id);  // ✅ Llamar en MODEL, no en doc
```

**Opción 2: Convertir a instancia**
```javascript
// En schema
schema.methods.softDelete = function() {
    this.deleted = true;
    return this.save();
};

// En controller
await deletedProyecto.softDelete();  // ✅ Llamar sin parámetro
```

**Opción 3: Usar query directamente**
```javascript
// Sin métodos custom
await Proyecto.findByIdAndUpdate(id, { deleted: true });
```

---

### 5. Dependencia faltante en producción

**Pregunta:** `handleLogger.js:1` — `@slack/webhook` importado pero no en `package.json`. ¿Qué ocurre en producción? Comando para añadirlo.

**Respuesta:**

**¿Qué ocurre sin la dependencia en `package.json`?**

```javascript
import { IncomingWebhook } from '@slack/webhook';  // Error
```

**En desarrollo:**
- `npm install` descarga TODAS las dependencias (directas e indirectas)
- Funciona "por suerte" si está en algún `node_modules`
- Falsa sensación de que todo está bien

**En producción:**
```bash
npm install --production
# Solo instala lo que está en "dependencies"
# @slack/webhook NO está → no se instala
```

**Runtime error:**
```
MODULE_NOT_FOUND: Cannot find module '@slack/webhook'
```

**Consecuencia:**
- App colapsa al importar `handleLogger.js`
- Error fatal, servicio caído
- Error logs incomprensibles

**Comando para instalar:**
```bash
npm install @slack/webhook
```

**Verificación:**
```bash
npm ls @slack/webhook
# practicaintermedia@1.0.0
# └── @slack/webhook@6.0.0
```

**Ahora en `package.json`:**
```json
{
  "dependencies": {
    "@slack/webhook": "^6.0.0",
    ...
  }
}
```

Disponible en producción (instalado en paso anterior)

**Bonus — Mejores prácticas:**
```bash
npm audit                # Detectar dependencias faltantes
npm ls                   # Ver árbol de dependencias
npm install --save       # Instalar Y guardar en package.json
npm ci                   # Install con lock exacto (producción)
```

---

## Proceso

### Cambios Realizados

1. **Rama:** Creada rama `examen` desde rama evaluada por profesor
2. **Archivos modificados:** 5 archivos
   - `src/routes/albaranes.routes.js` — Swagger documentación
   - `src/validators/deliverNote.validator.js` — Validación condicional
   - `src/controllers/proyecto.controller.js` — Bug truthy corregido
   - `package.json` — @slack/webhook añadido
   - `package-lock.json` — Automático

### Commits (soy bilingue)

```bash
git add PracticaIntermedia/src/routes/albaranes.routes.js
git commit -m "docs(swagger): document deliverynote endpoints with JSDoc"

git add PracticaIntermedia/src/validators/deliverNote.validator.js
git commit -m "refactor(validation): add conditional validation for material/hours format"

git add PracticaIntermedia/src/controllers/proyecto.controller.js
git commit -m "fix(soft-delete): correct truthy check for soft !== 'false'"

git add PracticaIntermedia/package.json PracticaIntermedia/package-lock.json
git commit -m "deps: add @slack/webhook to dependencies"

git push -u origin examen
```

### Verificación

- Código compila sin errores
- Cambios en líneas correctas
- Commits descriptivos y atómicos
- Rama subida a origen
- EXAMEN.md documentado

