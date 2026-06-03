# Classora Server

Backend NestJS para Classora, preparado para correr localmente y desplegarse en Railway o Render usando PostgreSQL de Supabase.

## Requisitos

- Node.js
- npm
- PostgreSQL accesible desde la aplicación

## Correr local

1. Instalar dependencias:

```bash
npm install
```

2. Crear un archivo `.env` tomando como base `.env.example`.

3. Configurar las variables de base de datos y autenticación.

4. Ejecutar en modo desarrollo:

```bash
npm run start:dev
```

La API escucha por defecto en `http://localhost:3030`.

## Scripts

```bash
npm run build
npm run start
npm run start:prod
npm run start:dev
```

`start` y `start:prod` ejecutan `node dist/main`, por lo que antes de usarlos debe existir el build en `dist`.

## Variables de entorno

```env
PORT=3030
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
DATABASE_HOST=
DATABASE_PORT=5432
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_NAME=
DATABASE_SSL=true
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

Notas:

- `FRONTEND_URL` debe apuntar al dominio del frontend desplegado en Vercel.
- `DATABASE_SSL=true` habilita SSL con `rejectUnauthorized: false`, necesario para conexiones como Supabase o Railway.
- `synchronize` de TypeORM está deshabilitado por defecto. En local puede activarse con `DATABASE_SYNCHRONIZE=true`; en producción siempre queda deshabilitado.
- No uses secretos reales en `.env.example` ni en archivos versionados.

## Deploy en Railway

1. Crear un nuevo proyecto en Railway desde el repositorio.
2. Configurar el servicio como aplicación Node.js.
3. Agregar las variables de entorno listadas arriba.
4. Usar las credenciales de Supabase PostgreSQL:
   - `DATABASE_HOST`
   - `DATABASE_PORT`
   - `DATABASE_USERNAME`
   - `DATABASE_PASSWORD`
   - `DATABASE_NAME`
   - `DATABASE_SSL=true`
5. Configurar `NODE_ENV=production`.
6. Configurar `FRONTEND_URL` con el dominio de Vercel.
7. Railway debe construir con:

```bash
npm install
npm run build
```

8. El comando de arranque debe ser:

```bash
npm run start:prod
```

## Deploy en Render

Usa la misma configuración de variables que Railway.

- Build command: `npm install && npm run build`
- Start command: `npm run start:prod`

## Health check

Probar localmente:

```bash
curl http://localhost:3030/health
```

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "classora-server"
}
```
