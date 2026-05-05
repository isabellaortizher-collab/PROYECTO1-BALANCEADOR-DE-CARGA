## Estructura del Proyecto hasta ahora
La organización de los archivos es la siguiente para asegurar que cada contenedor tenga sus responsabilidades aisladas:
docker-compose.yml: Orquestador principal que levanta los servicios (balancer, web1, web2, web3 y artillery).
/balancer: Contiene el Dockerfile de Apache y el archivo balancer.conf donde se definen los nodos y el algoritmo de balanceo (Round Robin o Least Connections).
/web: Contiene la lógica de los servidores backend con sus respectivos directorios htmlX para identificar qué nodo responde.
/artillery: Carpeta dedicada a las pruebas de carga, que incluye el script de pruebas y el almacenamiento de reportes generados.

Comandos de Ejecución
A continuación, se describen los pasos para poner en marcha el entorno y realizar las mediciones.
**1. Despliegue del Clúster**
Este comando se encarga de construir las imágenes personalizadas y levantar los servicios en segundo plano.
```bash
sudo docker compose up -d --build
```

**¿Para qué se usa?:** Construye las imágenes de Apache y los servidores web basándose en los Dockerfile. El flag -d (detached) permite que los contenedores sigan corriendo sin bloquear tu terminal, y --build asegura que cualquier cambio en la configuración de Apache sea aplicado.
Shutterstock
**Ejecución de Pruebas de Carga (Reporte Local)**
Una vez que el clúster está arriba, usamos el contenedor de Artillery para atacar al balanceador y generar métricas de rendimiento locales.
```bash
sudo docker compose run artillery run -o reports/resultado.json test-load.yml
```
**¿Para qué se usa?:** Arranca el contenedor de Artillery para ejecutar el script test-load.yml. El parámetro -o genera un archivo .json en la carpeta de reportes. Este archivo contiene datos técnicos detallados sobre latencia (p95, p99), errores y peticiones por segundo.
** Visualización en la Web de Artillery (Artillery Cloud)**
Para una interfaz gráfica avanzada y análisis histórico, los resultados se pueden subir a la plataforma oficial de Artillery.
```bash
sudo docker compose run artillery run --record --key TU_API_KEY_AQUI test-load.yml
```
**¿Para qué se usa?:** Envía las métricas en tiempo real a la consola web de Artillery.
Importante: Para que este paso funcione, el equipo necesita crear una cuenta en artillery.io, obtener su API KEY y sustituirla en el comando.
 Nota: Los reportes en la nube son limitados en la versión gratuita (retención de datos y número de pruebas), por lo que se recomienda usarlos solo para las pruebas finales.
**Explicación del Script de Pruebas (test-load.yml)**
El archivo de configuración de Artillery define cómo se va a "estresar" el balanceador. Aquí está el desglose de los parámetros configurados:
target: Apunta a http://balancer:80. Se usa el nombre del servicio definido en el docker-compose para comunicación interna.
phases: Define la intensidad de la prueba en 4 etapas para ver cómo escala el servidor:
Fase 1 a 4: Cada una dura 60 segundos.
arrivalRate: Define cuántos usuarios nuevos entran por segundo (desde 5 hasta 100).
maxVusers: Es el límite de usuarios concurrentes (50, 100, 500 y 1000). Esto evita que la prueba colapse la máquina host si los servidores no responden a tiempo.
scenarios: Define la acción del usuario. En este caso, una navegación básica (GET /) que permite verificar qué nodo del backend está procesando la solicitud.
