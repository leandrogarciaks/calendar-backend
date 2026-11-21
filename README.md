Backend MERN - Calendar

## Descripción

Backend (API REST) del calendario de la app. Usa el stack MERN:
Express 5, Mongoose (MongoDB), JWT (`jsonwebtoken`) para la autenticación,
`bcryptjs` para hashear contraseñas, `express-validator` para validar las
peticiones, `cors` para permitir peticiones desde la app React, y `moment`
para validar fechas de eventos. El frontend se encuentra en el repositorio
`08-calendar` (React).

## Requisitos previos

- Node.js (v14 o superior).
- MongoDB, preferiblemente un cluster en Atlas (`mongodb+srv://...`) o un
  MongoDB local corriendo. La conexión se define en `DB_CNN`.
- `npm` o `yarn`.

## Instalación

1. Clonar el repositorio y situarse en la carpeta del backend:

   ```
   git clone <url-del-repo>
   cd 08-calendar-backend
   ```

2. Instalar las dependencias:

   ```
   npm install
   ```

   Las dependencias se definen en `package.json`:
   `express`, `mongoose`, `bcryptjs`, `cors`, `dotenv`, `express-validator`,
   `jsonwebtoken` y `moment`.

3. Configurar las variables de entorno. El archivo `.env` ya existe
   (está en `.gitignore`); si falta, copia `.env.template` a `.env` y
   configura lo siguiente (o edita `.env` directamente):
   ```
   PORT=4000
   DB_CNN=mongodb+srv://<usuario>:<contrasena>@<cluster>.mongodb.net/<nombre-base-datos>
   SECRET_JWT_SEED=<cualquier cadena secreta que uses>
   ```

   - `PORT`: puerto donde escuchará el servidor.
   - `DB_CNN`: cadena de conexión a la base de datos (formato Atlas
     `mongodb+srv://...`, o `mongodb://...` para una instancia local).
   - `SECRET_JWT_SEED`: cadena secreta usada para firmar y verificar los
     tokens JWT. Debe ser secreta y poco predecible.
     `dotenv` carga estas variables desde `.env` al arrancar el servidor
     (ver `require('dotenv').config()` en `index.js`).

## Ejecutar

Desarrollo, con recarga automática con nodemon (requiere tener nodemon
instalado: `npm i -D nodemon`):

```
npm run dev
```

Ejecución directa con `node index.js` (siempre disponible):

```
npm start
```

Al arrancar el servidor verás en consola:

- `DB Online`: se conectó correctamente a MongoDB.
- `Servidor corriendo en el puerto 4000`: el API está listo.

## API

El servidor expone dos grupos de rutas (ver `routes/`):

### Autenticación — `/api/auth`

| Método | Ruta              | Descripción                                     | Autenticación |
| ------ | ----------------- | ----------------------------------------------- | ------------- |
| GET    | `/api/auth`       | Hola mundo (`{ ok: true, msg: 'Hola Mundo' }`). | No            |
| POST   | `/api/auth`       | Login de usuario.                               | No            |
| POST   | `/api/auth/new`   | Registro de usuario nuevo.                      | No            |
| GET    | `/api/auth/renew` | Renueva el token JWT.                           | Sí (JWT)      |

## Autenticación con JWT

- El token se envía en la cabecera `x-token` (ver `middlewares/validar-jwt.js`).
- El token expira en **2 horas** (`expiresIn: '2h'` en `helpers/jwt.js`).
- Las rutas bajo `/api/events` requieren el token válido.

## Endpoints de autenticación en detalle

#### POST /api/auth (Login)

Body (`application/json`):

```json
{ "email": "usuario@ejemplo.com", "password": "123456" }
```

Validación (`express-validator` en `routes/auth.js`):

- `email`: debe ser un email válido.
- `password`: mínimo 6 caracteres.

Respuesta exitosa (200):

```json
{ "ok": true, "uid": "<id-mongo>", "name": "<nombre>", "token": "<JWT>" }
```

Respuestas de error (400):

- Email sin usuario: `{ "ok": false, "msg": "El usuario no existe con ese correo." }`
- Password incorrecto: `{ "ok": false, "msg": "Contraseña no valida." }`

#### POST /api/auth/new (Registro)

Body:

```json
{ "name": "Nombre del usuario", "email": "usuario@ejemplo.com", "password": "123456" }
```

Validación:

- `name`: no debe estar vacío.
- `email`: debe ser un email válido.
- `password`: mínimo 6 caracteres.

Respuesta exitosa (201):

```json
{ "ok": true, "uid": "<id-mongo>", "name": "<nombre>", "token": "<JWT>" }
```

Respuestas de error (400):

- Email ya registrado: `{ "ok": false, "msg": "El usuario ya existe con ese correo." }`

#### GET /api/auth/renew

Renueva (genera un token nuevo con los mismos `uid` y `name`). Requiere el
cabezal `x-token` válido.

Respuesta (200):

```json
{ "ok": true, "msg": "revalidarToken", "token": "<JWT nuevo>" }
```

Respuestas de error (401):

- Sin token: `{ "ok": false, "msg": "No hay token en la petición" }`
- Token inválido: `{ "ok": false, "msg": "Token no valido" }`

### Eventos — `/api/events`

Todas las rutas de este grupo pasan por el middleware `validarJWT`
(`routes/events.js`), por lo que requieren el cabezal `x-token` válido.

| Método | Ruta              | Descripción              |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/events`     | Lista todos los eventos. |
| POST   | `/api/events`     | Crea un evento nuevo.    |
| PUT    | `/api/events/:id` | Actualiza un evento.     |
| DELETE | `/api/events/:id` | Elimina un evento.       |

## Endpoints de eventos en detalle

#### GET /api/events (Listar eventos)

Respuesta (200):

```json
{
  "ok": true,
  "msg": [
    {
      "title": "<título>",
      "notes": "<notas>",
      "start": "<ISO>",
      "end": "<ISO>",
      "user": "<nombre del usuario (populate)>"
    }
  ]
}
```

Nota: en el controlador (`controllers/events.js`) el array de eventos se
devuelve dentro del campo `msg` (campo usado para todo el payload, no es
el campo típico `data`). El modelo `Evento` define un `toJSON` que intenta
devolver un campo `id` en vez de `_id` al serializarse.

#### POST /api/events (Crear evento)

Body:

```json
{
  "title": "<título del evento>",
  "notes": "<notas opcionales>",
  "start": "<fecha inicial ISO>",
  "end": "<fecha final ISO>"
}
```

Validación (`routes/events.js`):

- `title`: obligatorio.
- `start` y `end`: obligatorios, validados con `helpers/isDate`
  (acepta cualquier cadena parseable por `moment`, ej. `2026-11-20T10:00:00`).

Respuesta exitosa (201):

```json
{
  "ok": true,
  "msg": "crearEvento",
  "evento": { "title": "...", "notes": "...", "start": "...", "end": "...", "user": "<uid>" }
}
```

El campo `user` del evento se asigna con el `uid` del token (`req.uid`).

#### PUT /api/events/:id (Actualizar evento)

Body: mensaje del evento a actualizar (`title`, `start`, `end` y opcionalmente
`notes`; `user` se fuerza al del token).

Respuesta exitosa (200):

```json
{ "ok": true, "msg": "actualizarEvento", "evento": { ... } }
```

Respuestas de error:

- Evento no encontrado (404): `{ "ok": false, "msg": "Evento no existe por ese id" }`
- Sin privilegio sobre el evento (401): `{ "ok": false, "msg": "No tiene privilegio de editar este evento." }`

#### DELETE /api/events/:id (Eliminar evento)

Respuesta exitosa (200):

```json
{ "ok": true, "msg": "El evento con <id> fue eliminado" }
```

Respuestas de error:

- Evento no encontrado (404): `{ "ok": false, "msg": "Evento no existe por ese id" }`
- Sin privilegio (401): `{ "ok": false, "msg": "No tiene privilegio de eliminar este evento." }`

```

Véase también
-------------
- `index.js`: arranque del servidor y montado de rutas (`/api/auth`, `/api/events`).
- `database/config.js`: conexión a MongoDB (`DB_CNN`).
- `models/Usuario.js`, `models/Evento.js`: esquemas de la base de datos.
- `helpers/jwt.js`, `helpers/isDate.js`: generación de tokens y validación de fechas.
- `middlewares/validar-jwt.js`, `middlewares/validar-campos.js`: middlewares de seguridad y validación.
- `routes/`, `controllers/`: definición y lógica de las peticiones de la API.
```
