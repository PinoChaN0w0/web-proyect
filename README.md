# Level-Up Gamer

Tienda online de productos gamer. Aplicación full stack: **React + Vite** (front), **Spring Boot** (API REST) y **PostgreSQL** (base de datos), desplegada en una instancia **AWS EC2**.

**Grupo 2:** Diego Castillo, Cristian Ayala, Diego Reyes.

**Demo pública:** http://3.211.153.194

## Qué incluye

- Catálogo de productos cargado desde la API (sin datos quemados), con búsqueda, filtro por categoría y detalle.
- Carrito de compras (guardado en el navegador) con 20 % de descuento para correos `@duocuc.cl` y `@duoc.cl`.
- Registro e inicio de sesión con contraseñas en BCrypt y sesión por JWT.
- Dos roles: `CLIENTE` y `ADMIN`. Las vistas y las acciones se restringen por rol en el front y en el backend.
- Panel ADMIN: CRUD de productos (`/admin`) y CRUD de usuarios (`/admin/usuarios`).
- Manejo de errores HTTP (400, 401, 403, 404, 409) con mensajes en la interfaz.

## Arquitectura

```
Navegador (React)  ──HTTP :80──▶  Nginx  ──/api/──▶  Spring Boot :8080  ──JDBC──▶  PostgreSQL :5432
  SPA + cliente API              sirve dist/          JWT, roles, CORS              BD levelup
                                 y hace proxy         (solo acceso local)           (no expuesta)
                                      └──────────── todo en una instancia AWS EC2 ────────────┘
```

Front y API se sirven desde el mismo origen, por lo que en producción no hay problemas de CORS ni de contenido mixto. El diagrama detallado está en `docs/diagrama_arquitectura.png`.

## Estructura del repositorio

```
src/
  api/          client.js (cliente HTTP con Bearer token)
  components/   Layout, Header, Footer, ProductCard, ProductImage, ProtectedRoute
  context/      AuthContext (sesión, rol, token), CartContext (carrito)
  pages/        Home, Productos, ProductoDetalle, Carrito, Login, Registro,
                Admin (CRUD productos), AdminUsuarios (CRUD usuarios)
  styles/       Styles.css + react-overrides.css
  utils/        format.js, validators.js
public/ASSETS/  imágenes de productos
Backend/        API REST Spring Boot + PostgreSQL (versión desplegada)
services/       versión alternativa en microservicios (auth 8081, product 8082, user 8083)
deploy/         scripts y configuración para EC2 (Nginx, systemd, setup)
docs/           ERS, diagrama, colección Postman y respaldo SQL
```

`Backend/` es el backend que se despliega. `services/` es una variante en microservicios que comparte la misma base `levelup` y el mismo `JWT_SECRET`; no se usa en la demo.

## Requisitos

- Node.js 18 o superior
- Java 17 o superior y Maven 3.9 o superior
- PostgreSQL 14 o superior
- Google Chrome o Chromium (solo para las pruebas Karma)

## Ejecución local

### 1. Base de datos

```sql
CREATE DATABASE levelup;
```

### 2. Backend (`Backend/`)

```bash
cd Backend
export JWT_SECRET="$(openssl rand -base64 48)"   # obligatorio, mínimo 32 caracteres
mvn spring-boot:run
```

La API queda en `http://localhost:8080`. Si la base está vacía, el backend crea un administrador inicial y el catálogo de 10 productos.

### 3. Frontend

Crea un `.env` en la raíz (no se sube a git):

```
VITE_API_URL=http://localhost:8080
```

```bash
npm install
npm run dev        # http://localhost:5173
```

El front usa `VITE_API_URL` para todas las llamadas. Las variables `VITE_AUTH_API_URL`, `VITE_PRODUCT_API_URL` y `VITE_USER_API_URL` solo se usan con la variante de microservicios; déjalas vacías para usar el backend único.

## Variables de entorno

### Frontend

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API (en producción, la URL pública) |

El build de producción toma `.env.production`. Ahí `VITE_API_URL` apunta a la URL pública.

### Backend

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/levelup` |
| `DB_USERNAME` | Usuario de la base | `postgres` |
| `DB_PASSWORD` | Contraseña de la base | `postgres` |
| `JWT_SECRET` | Secreto de firma del JWT (mín. 32 caracteres) | sin valor: la app no arranca sin él |
| `JWT_EXPIRATION_MS` | Duración del token en milisegundos | `86400000` (24 h) |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma | `http://localhost:5173` |
| `PORT` | Puerto HTTP | `8080` |
| `JPA_DDL_AUTO` | Estrategia de esquema de Hibernate | `update` |
| `ADMIN_EMAIL` | Correo del administrador inicial | `admin@levelup.cl` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | definir siempre en producción |

En el servidor las variables van en `/opt/levelup/backend.env` (permisos 600). Hay una plantilla en `deploy/backend.env.example`.

## Roles y permisos

| Rol | Puede |
|---|---|
| Visitante | Ver catálogo y detalle, usar el carrito, registrarse e iniciar sesión |
| `CLIENTE` | Lo anterior, con descuento Duoc si corresponde |
| `ADMIN` | Lo anterior, más CRUD de productos y de usuarios |

## Endpoints

| Método | Ruta | Acceso | Respuestas |
|---|---|---|---|
| POST | `/api/auth/register` | Público | 201, 400, 409 |
| POST | `/api/auth/login` | Público | 200, 400, 401 |
| GET | `/api/products`, `/api/products/{id}` | Público | 200, 404 |
| POST | `/api/products` | ADMIN | 201, 400, 401, 403 |
| PUT | `/api/products/{id}` | ADMIN | 200, 400, 401, 403, 404 |
| DELETE | `/api/products/{id}` | ADMIN | 204, 401, 403, 404 |
| GET, POST | `/api/users` | ADMIN | 200 / 201, 400, 401, 403, 409 |
| GET, PUT, DELETE | `/api/users/{id}` | ADMIN | 200 / 204, 400, 401, 403, 404, 409 |

Códigos: `400` datos inválidos, `401` sin token o credenciales incorrectas, `403` rol insuficiente, `404` recurso inexistente, `409` correo ya registrado. Las rutas protegidas esperan `Authorization: Bearer <token>`. Más detalle en `Backend/README.md`.

## Pruebas

### Jasmine/Karma (pruebas exigidas por la rúbrica)

Hay 35 pruebas en 6 archivos `src/**/*.spec.js(x)`: `client`, `AuthContext`, `CartContext`, `productos`, `validators` y `format`.

```bash
npm run test:karma
```

Genera el informe de cobertura en `coverage-karma/html/index.html` y un resumen en la consola. El umbral mínimo configurado es 60 %.

### Vitest + Testing Library

```bash
npm test               # ejecuta una vez
npm run test:coverage  # con informe en coverage/
```

Son los archivos `src/**/*.test.{js,jsx}`.

## Despliegue en AWS EC2

Resumen del procedimiento (detalle en `deploy/DEPLOY.md`):

1. Security Group: abrir 22 (solo tu IP), 80 y 443. **No abrir 5432 ni 8080.**
2. En tu PC, generar el paquete con la IP pública:
   ```bash
   bash deploy/preparar-paquete.sh <IP_PUBLICA>
   ```
   Esto compila el front con `VITE_API_URL` apuntando a la IP y el backend en un JAR.
3. Subir `paquete/` a la instancia y ejecutar el setup:
   ```bash
   scp -i clave.pem -r paquete ec2-user@<IP_PUBLICA>:~/
   ssh -i clave.pem ec2-user@<IP_PUBLICA>
   cd paquete && bash setup-ec2.sh <IP_PUBLICA>
   ```
   El script instala PostgreSQL, Java 17 y Nginx, crea la base `levelup` con una contraseña aleatoria, genera `JWT_SECRET` y deja el backend como servicio `levelup-backend` (systemd).
4. Nginx sirve `dist/` con rewrite a `index.html` (SPA) y reenvía `/api/` a `127.0.0.1:8080`.
5. Verificar en la URL pública: login, restricción por rol, CRUD de productos y CRUD de usuarios.

Para actualizar solo el front: `npm run build`, copiar `dist/*` a `/var/www/levelup/` y recargar Nginx.

## Documentación y entregables

| Archivo | Contenido |
|---|---|
| `docs/ERS.pdf` | Especificación de requerimientos: modelo de datos, flujos de autenticación y CRUD, arquitectura |
| `docs/diagrama_arquitectura.png` | Diagrama de arquitectura React, Spring Boot y PostgreSQL en EC2 |
| `docs/postman_collection.json` | Colección Postman (variable `baseUrl` con la URL pública) |
| `docs/respaldo.sql` | Respaldo real de la base `levelup` |
| `Backend/README.md` | Detalle de la API y del backend |
| `deploy/DEPLOY.md` | Guía de despliegue en EC2 |

### Postman

Importa `docs/postman_collection.json`, ajusta `baseUrl` a la URL pública y `adminPassword` a la contraseña del administrador. Los requests de login guardan `token` y `tokenCliente` automáticamente, y la carpeta de errores prueba los códigos 400, 401, 403, 404 y 409.

### Respaldo de la base

```bash
pg_dump -U <usuario> -d levelup -f docs/respaldo.sql
```

Para restaurar: `psql -U <usuario> -d levelup -f docs/respaldo.sql`.

## Seguridad

- No subir `.env` ni `backend.env` al repositorio. Usar `.env.example` como plantilla.
- Generar `JWT_SECRET` con `openssl rand -base64 48` y no reutilizar el de desarrollo.
- Cambiar las credenciales del administrador inicial en producción con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- Las contraseñas se guardan con BCrypt; el backend es sin estado (JWT) y aplica los permisos por rol en cada ruta.
- PostgreSQL escucha solo en local y el puerto 5432 está cerrado en el Security Group.

## Notas

- `carrito.html`, `registro.html` y la carpeta `ASSETS/` de la raíz son restos del sitio estático original y no forman parte de la aplicación React.
- La aplicación es una SPA: cualquier hosting debe redirigir todas las rutas a `index.html`.
