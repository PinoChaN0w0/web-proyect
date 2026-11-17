# Implementación - Level-Up Gamer (Full Stack)

Fecha: 2026-11-15  
Rama/espacio: código creado en el repositorio actual (`web-proyect`).

## 1. Resumen de lo realizado

Se creó la base de un backend **Spring Boot + PostgreSQL** y artefactos de integración/documentación para cumplir la rúbrica indicada (React + Spring Boot + BD, login con BCrypt/JWT, roles `ADMIN`/`CLIENTE`, CRUD productos, CRUD usuarios admin, CORS, variables de entorno, despliegue cloud, documentación). Se priorizó **PostgreSQL** (BD libre, preferencia del alumno, a ejecutar en EC2) y autenticación propia en el backend según la rúbrica.

### Estructura agregada
- `backend/` — API REST Spring Boot (Maven, Java 17)
  - `pom.xml`
  - `src/main/resources/application.properties`
  - `src/main/java/cl/levelup/backend/...`
    - `LevelUpBackendApplication.java`
    - `model/` → `User`, `Product`, `Role`
    - `repository/` → `UserRepository`, `ProductRepository`
    - `dto/` → `AuthDtos`, `ProductDtos`, `UserDtos`
    - `security/` → `JwtService`, `JwtAuthFilter`, `CustomUserDetailsService`
    - `config/` → `SecurityConfig` (CORS, stateless, reglas por rol), `DataInitializer`
    - `service/` → `AuthService`, `ProductService`, `UserService`
    - `controller/` → `AuthController`, `ProductController`, `UserController`
    - `exception/` → `GlobalExceptionHandler`
  - `README.md`, `.gitignore`
- `docs/` — documentación y entregables
  - `IMPLEMENTACION.md` (este archivo)
  - `postman_collection.json` (colección Postman)
  - `respaldo.sql` (esquema/datos de referencia PostgreSQL)
- Frontend (integración inicial)
  - `.env.example` (`VITE_API_URL`)
  - `src/api/client.js` (cliente HTTP con Bearer token)

## 2. Backend: diseño y cumplimiento de requisitos

### 2.1 Persistencia (PostgreSQL)
- Driver `org.postgresql`, URL/credenciales por variables de entorno: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
- Entidades JPA:
  - `users` (`id`, `nombre`, `email` único, `password` BCrypt, `fecha_nacimiento`, `role`).
  - `products` (`id`, `nombre`, `categoria`, `precio`, `emoji`, `imagen`, `descripcion`).
- `spring.jpa.hibernate.ddl-auto` configurable (`JPA_DDL_AUTO`, default `update`). Recomendado usar Flyway/Liquibase para producción/migraciones.
- **Respaldo:** `docs/respaldo.sql` de referencia; respaldo real con `pg_dump -U <usuario> -d levelup -f docs/respaldo.sql`.

### 2.2 Login y seguridad
- **Registro** `POST /api/auth/register`: valida campos, edad >= 18, email válido, contraseña >= 6 y confirmación, correo único; guarda contraseña con **BCrypt** (`PasswordEncoder`), rol por defecto `CLIENTE`.
- **Login** `POST /api/auth/login`: autentica contra BD, retorna **JWT** (`Bearer`) + datos de usuario (`id`, `nombre`, `email`, `role`) y `descuentoActivo` (regla Duoc: `@duocuc.cl` / `@duoc.cl`).
- **JWT:** firmado HS256 (`JWT_SECRET`, `JWT_EXPIRATION_MS`), filtro `JwtAuthFilter` (stateless, sin sesión de servidor).
- **Roles y restricción:**
  - Público: `/api/auth/**`, `GET /api/products/**`.
  - `ADMIN`: `POST|PUT|DELETE /api/products/**`, todo `/api/users/**`.
  - Rutas/acciones de admin en front deben restringirse según `role` del token/usuario.

### 2.3 CRUD de Productos (REST)
- `GET /api/products` → 200 lista.
- `GET /api/products/{id}` → 200 o 404.
- `POST /api/products` → 201 creado (ADMIN), validaciones (`nombre`, `categoria`, `precio >= 1`).
- `PUT /api/products/{id}` → 200 actualizado (ADMIN) o 404.
- `DELETE /api/products/{id}` → 204 (ADMIN) o 404.
- Manejo de errores/validaciones vía `GlobalExceptionHandler` (400 con detalle de campos, 404, 409 conflicto, 401 credenciales inválidas).

### 2.4 CRUD de Usuarios (solo ADMIN)
- `GET/POST/PUT/DELETE /api/users/**` protegido con rol `ADMIN`.
- `POST` crea usuario con rol indicado y password BCrypt; `PUT` permite actualizar datos y (opcional) password; email único.

### 2.5 CORS y configuración
- CORS configurable por `CORS_ALLOWED_ORIGINS` (por defecto `http://localhost:5173`).
- Sin datos sensibles hardcodeados en código: secretos y conexión por entorno.

### 2.6 Datos iniciales (seed)
`DataInitializer` (CommandLineRunner) crea si no existen:
- Usuario admin: `admin@levelup.cl` / `Admin123!` (rol `ADMIN`, **cambiar en despliegue**).
- 10 productos del catálogo original (`src/data/productos.js`).

## 3. Frontend: integración preparada

- `.env.example` define `VITE_API_URL` (URL pública/base de la API en despliegue).
- `src/api/client.js`: helper `apiFetch` que agrega `Authorization: Bearer <token>` desde `localStorage.token` y expone funciones (`login`, `register`, `getProducts`, CRUD productos/usuarios).
- **Pendiente de adaptar en el front** para cumplir “sin datos quemados” y consumo real de la API:
  - `src/context/AuthContext.jsx`: usar `api.login`/`api.register`, persistir `token` y datos/rol devueltos, derivar sesión desde token/usuario (no desde `usuarios` en localStorage).
  - `src/data/productos.js` / vistas `Productos`, `ProductoDetalle`, `Home`: cargar catálogo desde `GET /api/products` (estado/efecto o loader) en lugar de arreglo estático.
  - `src/pages/Admin.jsx`: reemplazar login hardcodeado y mutación en memoria por login de backend (rol ADMIN) y llamadas `api.create/update/deleteProduct`.
  - Agregar manejo de estados de carga/error y lectura de `import.meta.env.VITE_API_URL`.
  - **Pruebas:** la rúbrica pide **al menos 10 pruebas significativas en Jasmine/Karma** con informe de cobertura; el proyecto actualmente usa Vitest/RTL (`src/**/*.test.*`). Debe incorporarse/adecuarse a Jasmine/Karma según lo exigido por el docente y generar el informe de cobertura correspondiente.

## 4. Cómo ejecutar (local)

### Backend
1. Instalar PostgreSQL y crear BD: `CREATE DATABASE levelup;`
2. Configurar variables (o usar defaults) y desde `backend/`:
   ```bash
   mvn spring-boot:run
   ```
3. Probar: `POST http://localhost:8080/api/auth/login` con `{"email":"admin@levelup.cl","password":"Admin123!"}`.

### Frontend
1. Copiar `.env.example` a `.env` y ajustar `VITE_API_URL`.
2. `npm install && npm run dev`.

## 5. Despliegue en AWS EC2 (PostgreSQL en la instancia)

1. **EC2:** instancia Linux, abrir puertos 80/443 (y 8080 si no hay proxy) en Security Group; **no exponer 5432**.
2. **PostgreSQL:** instalar y crear BD/usuario; datos en disco persistente.
3. **Backend:** `mvn -DskipTests package` → subir y ejecutar JAR con variables de entorno (`DB_URL=jdbc:postgresql://localhost:5432/levelup`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` apuntando al dominio/URL del front, etc.). Recomendado Nginx como reverse proxy + HTTPS.
4. **Frontend:** `npm run build` y servir `dist/` (Nginx/Amplify/S3+CloudFront); configurar `VITE_API_URL` a la URL pública de la API antes del build.
5. **Verificación:** demo desde URL pública; probar login, restricción por rol, CRUD productos y CRUD usuarios (admin).

## 6. Postman y documentación
- Colección: `docs/postman_collection.json` (variable `baseUrl` y `token`). Tras login, copiar el JWT a `token` para endpoints protegidos.
- Respaldo: `docs/respaldo.sql` (referencia) / `pg_dump` para el real.
- ERS: actualizar con modelo de datos (users/products/roles), casos de uso auth y CRUD, y arquitectura React↔Spring Boot↔PostgreSQL (pendiente de ajustar al formato exigido por el curso).

## 7. Decisiones y notas
- **BD:** PostgreSQL (preferencia y BD libre confirmada), ejecutándose en EC2; se descartó Supabase como BD para mantener control directo, pero es compatible si se requiere.
- **Extras opcionales (no implementados):** API de promos dedicada, Webpay (ambiente integración), Resend, reCAPTCHA, Google Maps/Shipit — pueden agregarse sobre esta base sin romper el core.
- **Compatibilidad con estado anterior:** el front original usa `localStorage` (`carrito`, `usuarioLogueado`, etc.) y catálogo estático; la migración completa a API requiere los cambios indicados en §3 para evitar datos quemados y cumplir integración front-back.
