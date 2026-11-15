# Microservicios - Estado e indicaciones

## Qué se separó
Se creó la carpeta `services/` con **3 microservicios** independientes (cada uno es una app Spring Boot con su propio `pom.xml`, configuración y puerto):

1. **`services/auth-service` (8081)** — Identidad/autenticación
   - Registro y login (`/api/auth/register`, `/api/auth/login`)
   - BCrypt, emisión de JWT con `role` e `id`, `descuentoActivo` Duoc
   - Seed de usuario admin (`admin@levelup.cl / Admin123!`)

2. **`services/product-service` (8082)** — Catálogo de productos
   - CRUD `/api/products` (GET público, POST/PUT/DELETE solo `ROLE_ADMIN` validado por JWT)
   - Seed del catálogo inicial

3. **`services/user-service` (8083)** — Administración de usuarios
   - CRUD `/api/users` (solo `ROLE_ADMIN` validado por JWT)

## Decisiones de diseño (pragmáticas para el proyecto)
- **BD:** los servicios pueden compartir la misma instancia/BD PostgreSQL (`levelup`) configurada por entorno. En microservicios "puros" cada servicio tendría su propia BD; aquí se prioriza separar servicios/dominios manteniendo una BD común (frecuente en proyectos académicos).
- **Seguridad/JWT:** `auth-service` emite el token; `product-service` y `user-service` lo validan con el mismo `JWT_SECRET` y autorizan por rol (claim `role`). **El `JWT_SECRET` debe ser idéntico en los 3 servicios.**
- **Frontend:** `src/api/client.js` actualizado para enrutar por servicio usando `VITE_AUTH_API_URL`, `VITE_PRODUCT_API_URL`, `VITE_USER_API_URL` (ver `.env.example`). `services/README.md` detalla la ejecución.

## Cómo ejecutarlo
1. PostgreSQL con BD `levelup`.
2. Levantar los 3 servicios (3 terminales), cada uno con `mvn spring-boot:run` y el mismo `JWT_SECRET`/config de BD.
3. Front con `.env` apuntando a 8081/8082/8083 y `npm run dev`.

## Lo que queda por tu cuenta respecto a esta separación
- **Probar la integración completa** con los 3 servicios levantados (login, roles, CRUD productos, CRUD usuarios) y corregir cualquier ajuste fino.
- **Consistencia de datos/seed:** como comparten BD, el seed de admin está en `auth-service` y el de productos en `product-service` (evita ejecutar inicializaciones conflictivas con datos distintos).
- **Despliegue:** si se despliega en la nube, exponer/configurar cada servicio (o un gateway/reverse proxy) y actualizar las variables `VITE_*_API_URL` y `CORS_ALLOWED_ORIGINS` a las URLs públicas. Asegurar que `JWT_SECRET` sea el mismo en todos.
- **Evolución opcional:** agregar API Gateway, separar BDs por servicio, o extraer más dominios (carrito/pedidos/promos) si se requiere mayor granularidad.
- **Rúbrica:** la rúbrica pedía Spring Boot + BD; verifica con tu docente que la entrega en microservicios sea aceptada tal como está planteada. El monolito original permanece en `backend/` como referencia.
