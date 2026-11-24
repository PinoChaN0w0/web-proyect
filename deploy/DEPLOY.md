# Parte 2 – Pruebas Jasmine/Karma y despliegue en EC2

## A. Pruebas con Jasmine/Karma (≥ 10 pruebas + cobertura)

Se incluyen **35 pruebas** en 6 archivos `*.spec.js(x)` (no chocan con tus `*.test.jsx` de Vitest).

1. Copia a la raíz de tu proyecto: `karma.conf.cjs` y los `src/**/*.spec.*`.
2. Instala dependencias:
   ```bash
   npm i -D karma karma-jasmine jasmine-core karma-chrome-launcher karma-webpack \
     karma-coverage webpack babel-loader @babel/core @babel/preset-env \
     @babel/preset-react babel-plugin-istanbul
   ```
3. Agrega en `package.json` → `scripts`:
   ```json
   "test:karma": "karma start karma.conf.cjs"
   ```
4. Ejecuta (necesita Google Chrome/Chromium instalado):
   ```bash
   npm run test:karma
   ```
5. **Informe de cobertura** (entregable): `coverage-karma/html/index.html`
   (abre el `index.html` de la carpeta que genera; también sale un resumen en consola).
   Haz capturas del resumen en terminal y del HTML.

> Karma solo mide los archivos que los specs importan: client.js, AuthContext, CartContext,
> validators, format y productos. Para subir el % agrega specs de otros archivos.

## B. Corrección necesaria en el front

`src/api/client.js` usaba `localhost:8081/8082/8083` como valor por defecto, así que
`VITE_API_URL` **nunca se aplicaba**. Reemplaza tu archivo por `src/api/client.js` de esta
carpeta (los 3 defaults ahora caen en `VITE_API_URL`).

Además, tu `.env` tiene `VITE_*_API_URL=localhost...`: por eso se incluye `deploy/.env.production`
(copiar a la raíz) que los vacía.

## C. Infra en EC2 (Amazon Linux 2023 / Ubuntu; t3.small o t2.micro con swap)

**Security Group:** entrada 22 (solo tu IP), 80 y 443 (0.0.0.0/0). **NO abrir 5432 ni 8080.**
Asigna una Elastic IP para que la URL no cambie.

### 1. PostgreSQL (solo local)
```bash
# Amazon Linux 2023
sudo dnf install -y postgresql15-server && sudo postgresql-setup --initdb
sudo systemctl enable --now postgresql
sudo -u postgres psql <<'SQL'
CREATE USER levelup_user WITH PASSWORD 'CAMBIA_ESTA_CLAVE';
CREATE DATABASE levelup OWNER levelup_user;
SQL
```
Verifica que escucha solo en localhost (`listen_addresses = 'localhost'`, valor por defecto) y que
`pg_hba.conf` use `scram-sha-256`/`md5` (no `ident`) para 127.0.0.1.

### 2. Backend (JAR)
En tu PC (así no compilas en una máquina chica):
```bash
cd Backend && mvn -DskipTests package
scp -i clave.pem target/backend-0.0.1-SNAPSHOT.jar ec2-user@IP:/tmp/backend.jar
```
En EC2:
```bash
sudo dnf install -y java-17-amazon-corretto-headless nginx
sudo mkdir -p /opt/levelup && sudo mv /tmp/backend.jar /opt/levelup/ && sudo chown -R ec2-user /opt/levelup
cp backend.env.example /opt/levelup/backend.env   # edítalo con tus valores
chmod 600 /opt/levelup/backend.env
sudo cp levelup-backend.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now levelup-backend
journalctl -u levelup-backend -f        # debe decir "Started LevelUpBackendApplication"
curl http://127.0.0.1:8080/api/products # debe devolver los 10 productos
```
Si es una instancia de 1 GB, crea swap de 1 GB antes (`fallocate -l 1G /swapfile` …).

### 3. Front + Nginx
En tu PC, con `deploy/.env.production` copiado a la raíz y editado con tu IP/dominio:
```bash
npm ci && npm run build
scp -r -i clave.pem dist/* ec2-user@IP:/tmp/dist/
```
En EC2:
```bash
sudo mkdir -p /var/www/levelup && sudo rm -rf /var/www/levelup/* && sudo cp -r /tmp/dist/* /var/www/levelup/
sudo cp levelup.nginx.conf /etc/nginx/conf.d/levelup.conf
sudo nginx -t && sudo systemctl enable --now nginx && sudo systemctl reload nginx
```
(En Ubuntu el usuario es `ubuntu` y debes borrar `/etc/nginx/sites-enabled/default`.
En Amazon Linux, si Nginx devuelve 403 por SELinux: `sudo restorecon -Rv /var/www/levelup`.)

### 4. HTTPS (opcional pero recomendable)
Requiere un dominio apuntando a la Elastic IP. Luego `sudo certbot --nginx -d tudominio.cl`,
y vuelve a hacer el build con `VITE_API_URL=https://tudominio.cl` y
`CORS_ALLOWED_ORIGINS=https://tudominio.cl`. Sin dominio, la demo funciona por **HTTP** sobre la IP
(un front en http llamando a una API en http no tiene problemas de mixed content).

## D. Verificación en la URL pública (checklist para la demo)

| # | Prueba | Esperado |
|---|---|---|
| 1 | Abrir `http://IP/` y recargar en `/productos` | Carga (no 404: rewrite SPA) |
| 2 | Home/Productos | Se ven los 10 productos con imágenes |
| 3 | Login `admin@levelup.cl` / `Admin123!` | Entra con rol ADMIN, aparece /admin |
| 4 | CRUD productos (admin): crear, editar, eliminar | Persiste tras recargar |
| 5 | CRUD usuarios (/admin/usuarios) | Persiste tras recargar |
| 6 | Registrar un cliente y loguearse | Rol CLIENTE |
| 7 | Con CLIENTE abrir `/admin` | Redirige / sin acceso |
| 8 | `curl -i -X POST http://IP/api/products` sin token | 401/403 |
| 9 | Desde fuera: `nc -vz IP 5432` | Timeout (cerrado) |

Si algo falla: DevTools → Network (¿a qué URL llama el front? si dice localhost, el build no tomó
`.env.production`), y `journalctl -u levelup-backend`, `/var/log/nginx/error.log`.

## E. Seguridad antes de la demo
- Cambia la contraseña del admin (`Admin123!` es la de `DataInitializer`).
- Tu `docker-compose.yml` tiene un `JWT_SECRET` real escrito en el repo: genera uno nuevo para EC2
  y no reutilices ese.
- `server.error.include-message=always` expone mensajes de error; aceptable para demo.
