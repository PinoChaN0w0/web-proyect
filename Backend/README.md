# Backend - Level-Up Gamer (Spring Boot + PostgreSQL)

API REST para la tienda Level-Up Gamer. Cumple los requisitos de la rúbrica: auth con BCrypt/JWT, roles `ADMIN`/`CLIENTE`, CRUD de productos y CRUD de usuarios (solo admin), persistencia en PostgreSQL.

## Requisitos
- Java 17+
- Maven 3.9+
- PostgreSQL 14+ (local o en EC2)

## Variables de entorno
| Variable | Descripción | Ejemplo / default |
|---|---|---|
| `DB_URL` | JDBC URL de PostgreSQL | `jdbc:postgresql://localhost:5432/levelup` |
| `DB_USERNAME` | Usuario BD | `postgres` |
| `DB_PASSWORD` | Contraseña BD | `postgres` |
| `JPA_DDL_AUTO` | Estrategia DDL (`update`, `validate`, `none`) | `update` |
| `JWT_SECRET` | Secreto para firmar JWT (mín. 32 chars) | (cambiar en prod) |
| `JWT_EXPIRATION_MS` | Expiración token en ms | `86400000` |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos (coma) | `http://localhost:5173` |
| `PORT` | Puerto HTTP | `8080` |

## Ejecutar localmente
1. Crear la base de datos:
   ```sql
   CREATE DATABASE levelup;
   ```
2. Exportar variables (o usar defaults) y ejecutar:
   ```bash
   mvn spring-boot:run
   ```
3. API disponible en `http://localhost:8080`.

Al iniciar, si la BD está vacía, `DataInitializer` crea:
- Admin: `admin@levelup.cl` / `Admin123!` (rol `ADMIN`)
- Catálogo inicial de 10 productos.

## Endpoints principales
- `POST /api/auth/register` — registro (CLIENTE)
- `POST /api/auth/login` — login (devuelve JWT)
- `GET /api/products`, `GET /api/products/{id}` — público
- `POST|PUT|DELETE /api/products/{id}` — **ADMIN** (Bearer token)
- `GET|POST|PUT|DELETE /api/users/**` — **ADMIN**

## Respaldo SQL
```bash
pg_dump -U <usuario> -d levelup -f docs/respaldo.sql
```
(Se incluye `docs/respaldo.sql` de referencia con esquema y datos iniciales.)

## Despliegue en EC2 (resumen)
- Instalar Java 17 y PostgreSQL en la instancia (o usar Docker). No exponer el puerto 5432 públicamente.
- Configurar variables de entorno y ejecutar el JAR (`mvn package` → `java -jar target/backend-0.0.1-SNAPSHOT.jar`).
- Abrir en Security Group los puertos necesarios (80/443/8080 según proxy). Usar Nginx como reverse proxy recomendado.
- Servir el build del front (`npm run build`) y apuntar `VITE_API_URL` a la URL pública de la API.
