#!/usr/bin/env bash
# EN LA INSTANCIA EC2 (Amazon Linux 2023), dentro de ~/paquete. Uso: bash setup-ec2.sh TU_IP_PUBLICA
set -euo pipefail
IP="${1:?Uso: bash setup-ec2.sh TU_IP_PUBLICA}"
cd "$(dirname "$0")"; HERE="$(pwd)"

echo ">> Instalando PostgreSQL, Java 17 y Nginx..."
sudo dnf install -y postgresql15-server postgresql15 java-17-amazon-corretto-headless nginx

# Swap si la instancia tiene poca RAM
if [ "$(free -m | awk '/Mem:/{print $2}')" -lt 1500 ] && ! swapon --show | grep -q .; then
  echo ">> Creando swap de 1GB..."
  sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
  grep -q /swapfile /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

echo ">> Configurando PostgreSQL (solo local)..."
[ -d /var/lib/pgsql/data/base ] || sudo postgresql-setup --initdb
sudo sed -i -E '/^host/ s/ident$/scram-sha-256/' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl enable --now postgresql
sudo systemctl restart postgresql

sudo mkdir -p /opt/levelup && sudo chown "$USER" /opt/levelup
if [ ! -f /opt/levelup/backend.env ]; then
  DB_PASS="$(openssl rand -hex 16)"
  JWT="$(openssl rand -base64 48 | tr -d '\n')"
  cd /tmp
  sudo -u postgres psql -c "CREATE USER levelup_user WITH PASSWORD '$DB_PASS';"
  sudo -u postgres createdb -O levelup_user levelup
  cd "$HERE"
  cat > /opt/levelup/backend.env <<ENV
DB_URL=jdbc:postgresql://localhost:5432/levelup
DB_USERNAME=levelup_user
DB_PASSWORD=$DB_PASS
JWT_SECRET=$JWT
CORS_ALLOWED_ORIGINS=http://$IP
PORT=8080
JPA_DDL_AUTO=update
ENV
  chmod 600 /opt/levelup/backend.env
else
  echo ">> /opt/levelup/backend.env ya existe: se conserva (actualizando CORS)."
  sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=http://$IP|" /opt/levelup/backend.env
fi

echo ">> Instalando backend..."
cp backend.jar /opt/levelup/backend.jar
sed "s/^User=.*/User=$USER/" levelup-backend.service | sudo tee /etc/systemd/system/levelup-backend.service >/dev/null
sudo systemctl daemon-reload
sudo systemctl enable levelup-backend
sudo systemctl restart levelup-backend

echo ">> Instalando front + Nginx..."
sudo mkdir -p /var/www/levelup && sudo rm -rf /var/www/levelup/* && sudo cp -r dist/* /var/www/levelup/
sudo cp levelup.nginx.conf /etc/nginx/conf.d/levelup.conf
command -v restorecon >/dev/null && sudo restorecon -Rv /var/www/levelup >/dev/null || true
sudo nginx -t
sudo systemctl enable nginx
sudo systemctl restart nginx

echo ">> Esperando a que el backend responda (hasta 90s)..."
for i in $(seq 1 45); do
  if curl -fs http://127.0.0.1:8080/api/products >/dev/null; then OK=1; break; fi; sleep 2
done
if [ "${OK:-0}" = 1 ]; then
  echo "BACKEND OK: $(curl -s http://127.0.0.1:8080/api/products | head -c 120)..."
  echo "VÍA NGINX:  $(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1/api/products)  (esperado 200)"
  echo
  echo "=== LISTO ===  Abre http://$IP"
  echo "Admin: admin@levelup.cl / Admin123!   (cámbiala después)"
else
  echo "El backend no respondió. Revisa: journalctl -u levelup-backend -n 60"
  exit 1
fi
