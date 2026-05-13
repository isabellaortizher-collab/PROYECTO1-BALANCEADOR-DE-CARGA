#!/bin/bash
set -e

mkdir -p resultados-artillery

echo "Ejecutando prueba de 50 usuarios..."
sudo docker-compose run --rm artillery run \
  --output /results/balanceador-50.json \
  /scripts/balanceador-50.yml

echo "Ejecutando prueba de 100 usuarios..."
sudo docker-compose run --rm artillery run \
  --output /results/balanceador-100.json \
  /scripts/balanceador-100.yml

echo "Ejecutando prueba de 500 usuarios..."
sudo docker-compose run --rm artillery run \
  --output /results/balanceador-500.json \
  /scripts/balanceador-500.yml

echo "Ejecutando prueba de 1000 usuarios..."
sudo docker-compose run --rm artillery run \
  --output /results/balanceador-1000.json \
  /scripts/balanceador-1000.yml

echo "Todas las pruebas finalizaron correctamente."
echo "Resultados guardados en resultados-artillery/"
