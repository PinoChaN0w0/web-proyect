# Microservicios - Level-Up Gamer

Arquitectura separada en servicios independientes (Spring Boot + PostgreSQL), en lugar del backend monolítico (`backend/`).

## Servicios

| Servicio | Puerto (default) | Responsabilidad | Endpoints |
|---|---:|---|---|
| `auth-service` | 8081 | Autenticación y registro, emisión de JWT (BCrypt, roles) | `POST /api/auth/register`, `POST /api/auth/login` |
| `product-service` | 8082 | Catálogo y CRUD de productos (escritura solo ADMIN) | `GET/POST/PUT/DELETE /api/products` |
| `user-service` | 8083 | CRUD de usuarios (solo ADMIN) | `GET/POST/PUT/DELETE /api/users` |

> Nota: para simplificar el entorno escolar, los servicios pueden apuntar a la **misma base PostgreSQL** (`levelup`) mediante variables de entorno. Cada servicio gestiona su dominio; el token JWT (mismo `JWT_SECRET`) se emite en `auth-service` y se valida en `product-service` y `user-service`.

## Requisitos
- Java 17+, Maven 3.9+
- PostgreSQL (BD `levelup`)

## Ejecución local
En terminales separadas:

```bash
# 1) Auth
cd services/auth-service
mvn spring-boot:run

# 2) Productos
cd services/product-service
mvn spring-boot:run

# 3) Usuarios
cd services/user-service
mvn spring-boot:run
```

Variables comunes (en cada servicio): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET` (debe ser el mismo en los 3), `CORS_ALLOWED_ORIGINS`, `PORT`, `JPA_DDL_AUTO`.

- `auth-service` crea el admin seed `admin@levelup.cl / Admin123!` si no existe.
- `product-service` carga el catálogo inicial si la tabla está vacía.

## Frontend
Configurar `.env` en la raíz:
```
VITE_AUTH_API_URL=http://localhost:8081
VITE_PRODUCT_API_URL=http://localhost:8082
VITE_USER_API_URL=http://localhost:8083
```
El cliente `src/api/client.js` enruta cada operación al servicio correspondiente.

## Relación con `backend/`
`backend/` conserva la versión monolítica original. `services/` es la versión en microservicios solicitada. Elige una de las dos para ejecutar/desplegar (o usa un gateway con `VITE_API_URL` apuntando a él).