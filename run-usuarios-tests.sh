#!/bin/bash
set -e

export COMPOSE_HTTP_TIMEOUT=600
export DOCKER_CLIENT_TIMEOUT=600

echo "=========================================="
echo " Ejecutando prueba de 50 usuarios"
echo "=========================================="
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-50.json \
  /scripts/balanceador-50.yml

echo "=========================================="
echo " Ejecutando prueba de 100 usuarios"
echo "=========================================="
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-100.json \
  /scripts/balanceador-100.yml

echo "=========================================="
echo " Ejecutando prueba de 500 usuarios"
echo "=========================================="
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-500.json \
  /scripts/balanceador-500.yml

echo "=========================================="
echo " Ejecutando prueba de 1000 usuarios"
echo "=========================================="
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-1000.json \
  /scripts/balanceador-1000.yml

echo "=========================================="
echo " Ejecutando prueba de 5000 usuarios"
echo "=========================================="
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-5000.json \
  /scripts/balanceador-5000.yml

echo "=========================================="
echo " Todas las pruebas finalizaron correctamente"
echo " Resultados guardados en resultados-artillery/"
echo "=========================================="

ls -lh resultados-artillery
