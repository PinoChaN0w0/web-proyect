# Backend - Level-Up Gamer (Spring Boot + PostgreSQL)

API REST de la tienda Level-Up Gamer. Incluye autenticación con BCrypt y JWT, roles `ADMIN` y `CLIENTE`, CRUD de productos, CRUD de usuarios (solo ADMIN) y persistencia en PostgreSQL.

**URL pública (demo):** http://3.211.153.194
**API en producción:** http://3.211.153.194/api (Nginx reenvía `/api/` al backend en el puerto 8080)

## Requisitos

- Java 17 o superior
- Maven 3.9 o superior
- PostgreSQL 14 o superior (local o en EC2)

## Variables de entorno

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `DB_URL` | URL JDBC de PostgreSQL | `jdbc:postgresql://localhost:5432/levelup` |
| `DB_USERNAME` | Usuario de la base | `postgres` |
| `DB_PASSWORD` | Contraseña de la base | `postgres` |
| `JWT_SECRET` | Secreto de firma del JWT (mín. 32 caracteres) | sin valor: la app no arranca sin él |
| `JWT_EXPIRATION_MS` | Duración del token en milisegundos | `86400000` (24 h) |
| `CORS_ALLOWED_ORIGINS` | Orígenes permitidos, separados por coma | `http://localhost:5173` |
| `PORT` | Puerto HTTP | `8080` |
| `JPA_DDL_AUTO` | Estrategia de esquema (`update`, `validate`, `none`) | `update` |
| `ADMIN_EMAIL` | Correo del administrador inicial | `admin@levelup.cl` |
| `ADMIN_PASSWORD` | Contraseña del administrador inicial | definir siempre en producción |

En producción estas variables están en `/opt/levelup/backend.env` (permisos 600, fuera del repositorio). La plantilla es `deploy/backend.env.example`. Para generar un secreto: `openssl rand -base64 48`.

## Ejecutar localmente

1. Crear la base de datos:
   ```sql
   CREATE DATABASE levelup;
   ```
2. Definir al menos `JWT_SECRET` y ejecutar:
   ```bash
   export JWT_SECRET="$(openssl rand -base64 48)"
   mvn spring-boot:run
   ```
3. La API queda en `http://localhost:8080`.

Al iniciar con la base vacía, `DataInitializer` crea:

- Un usuario administrador con rol `ADMIN` (correo y contraseña tomados de `ADMIN_EMAIL` y `ADMIN_PASSWORD`).
- El catálogo inicial de 10 productos.

El seed solo corre si las tablas están vacías. Para cambiar la contraseña de un administrador que ya existe hay que editarlo desde `/admin/usuarios` o con `PUT /api/users/{id}`.

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

Las rutas protegidas requieren el encabezado `Authorization: Bearer <token>`, donde el token se obtiene en `POST /api/auth/login`.

### Códigos de error

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos (el cuerpo detalla cada campo) |
| 401 | Sin token, token inválido o credenciales incorrectas |
| 403 | Token válido pero sin rol `ADMIN` |
| 404 | Producto o usuario inexistente |
| 409 | Correo ya registrado |

### Reglas de validación

- **Registro:** nombre, fecha de nacimiento, correo válido y contraseña obligatorios; mayor de 18 años; contraseña de al menos 6 caracteres y confirmación igual; correo único. El rol asignado es siempre `CLIENTE`.
- **Login:** devuelve `token`, `id`, `nombre`, `email`, `role` y `descuentoActivo` (verdadero para `@duocuc.cl` y `@duoc.cl`).
- **Productos:** `nombre` y `categoria` obligatorios, `precio` mayor o igual a 1.

## Probar la API

Con curl (reemplaza los valores entre `<>`):

```bash
# Listar productos (público)
curl http://3.211.153.194/api/products

# Login y token
curl -X POST http://3.211.153.194/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<correo>","password":"<contraseña>"}'

# Crear producto (ADMIN)
curl -X POST http://3.211.153.194/api/products \
  -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
  -d '{"nombre":"Producto de prueba","categoria":"Accesorios","precio":9990}'
```

Con Postman: importar `docs/postman_collection.json`, dejar `baseUrl` en `http://3.211.153.194` y completar `adminPassword`. La colección guarda el token al hacer login y trae una carpeta con los errores esperados (400, 401, 403, 404 y 409).

## Respaldo de la base de datos

```bash
pg_dump -U <usuario> -d levelup -f docs/respaldo.sql
```

Para restaurar: `psql -U <usuario> -d levelup -f docs/respaldo.sql`.

## Despliegue en EC2

La demo corre en una sola instancia EC2 con Nginx, el backend y PostgreSQL. Pasos finales (guía completa en `deploy/DEPLOY.md`):

1. **Compilar el JAR** desde `Backend/`:
   ```bash
   mvn -DskipTests package
   ```
   Genera `target/backend-0.0.1-SNAPSHOT.jar`.
2. **Generar el paquete** desde la raíz del proyecto y subirlo a la instancia:
   ```bash
   bash deploy/preparar-paquete.sh 3.211.153.194
   scp -i clave.pem -r paquete ec2-user@3.211.153.194:~/
   ```
3. **Ejecutar el setup** en la instancia:
   ```bash
   ssh -i clave.pem ec2-user@3.211.153.194
   cd paquete && bash setup-ec2.sh 3.211.153.194
   ```
   Instala PostgreSQL, Java 17 y Nginx, crea la base `levelup`, genera la contraseña de la base y el `JWT_SECRET`, y deja el backend como servicio `levelup-backend` (systemd) leyendo `/opt/levelup/backend.env`.
4. **Revisar el servicio:**
   ```bash
   sudo systemctl status levelup-backend
   journalctl -u levelup-backend -f
   curl http://127.0.0.1:8080/api/products
   ```
5. **Seguridad de red:** el Security Group solo abre 22 (solo tu IP), 80 y 443. Los puertos 5432 (PostgreSQL) y 8080 (backend) no se exponen; el acceso es solo por Nginx.
6. **Verificar en la URL pública:** login, restricción por rol, CRUD de productos y CRUD de usuarios.

Si el front se publica en otro origen (por ejemplo, un dominio con HTTPS), actualizar `CORS_ALLOWED_ORIGINS` en `/opt/levelup/backend.env` y reiniciar con `sudo systemctl restart levelup-backend`.

## Seguridad

- No subir `.env` ni `backend.env` al repositorio.
- Usar un `JWT_SECRET` aleatorio distinto en cada entorno.
- Cambiar las credenciales del administrador inicial antes de la demo.
- Las contraseñas se guardan con BCrypt y la API no mantiene sesión en el servidor (JWT).
