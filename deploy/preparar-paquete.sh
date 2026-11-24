#!/usr/bin/env bash
# EN TU PC (Mac/Linux, o Git Bash en Windows). Uso: bash deploy/preparar-paquete.sh 54.1.2.3
# Requiere: Node 18+, Java 17+, Maven.
set -euo pipefail
IP="${1:?Uso: bash deploy/preparar-paquete.sh TU_IP_PUBLICA}"
cd "$(dirname "$0")/.."

cat > .env.production <<ENV
VITE_API_URL=http://$IP
VITE_AUTH_API_URL=
VITE_PRODUCT_API_URL=
VITE_USER_API_URL=
ENV

echo ">> Compilando front..."
npm install
npm run build

echo ">> Compilando backend..."
(cd Backend && mvn -q -DskipTests package)

echo ">> Armando paquete/ ..."
rm -rf paquete && mkdir paquete
cp -r dist paquete/dist
cp Backend/target/backend-0.0.1-SNAPSHOT.jar paquete/backend.jar
cp deploy/levelup.nginx.conf deploy/levelup-backend.service deploy/setup-ec2.sh paquete/

echo
echo "LISTO. Ahora sube la carpeta y ejecuta el setup:"
echo "  scp -i TU_CLAVE.pem -r paquete ec2-user@$IP:~/"
echo "  ssh -i TU_CLAVE.pem ec2-user@$IP"
echo "  cd paquete && bash setup-ec2.sh $IP"
