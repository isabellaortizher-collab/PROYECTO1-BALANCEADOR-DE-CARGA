# Proyecto 1 — Balanceador de Carga con Apache mod_proxy_balancer

## Arquitectura

```
                    ┌─────────────────────────────────────────┐
                    │          FRONTEND BALANCER              │
                    │     Apache + mod_proxy_balancer         │
                    │         Puerto: 8090                    │
                    └──────────────┬──────────────────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
          ┌──────▼──────┐                    ┌───────▼──────┐
          │  Frontend 1  │                    │  Frontend 2   │
          │  (React)     │                    │  (React)      │
          └─────────────┘                    └───────────────┘

                    ┌─────────────────────────────────────────┐
                    │           BACKEND BALANCER              │
                    │     Apache + mod_proxy_balancer          │
                    │         Puerto: 8080                    │
                    └──────────────┬──────────────────────────┘
                                   │
         ┌────────────┬────────────┴───────────┬────────────┐
         │            │                        │            │
   ┌─────▼─────┐ ┌────▼────┐            ┌──────▼────┐ ┌──────▼─────┐
   │ Backend 1 │ │Backend 2│            │ Backend 3 │ │   MySQL    │
   │  (Auth)   │ │ (Blog)  │            │  (Blog)   │ │  (Puerto   │
   │ Port:3301 │ └─────────┘            └───────────┘ │  3306)     │
   └───────────┘                                     └────────────┘
```

## Estructura del proyecto

```
proyecto1/
├── README.md
├── docker-compose.yml
├── .env
│
├── backend-balancer/              ← Apache con mod_proxy_balancer
│   ├── Dockerfile
│   └── apache.conf
│
├── backend1/                      ← Auth Service (Node.js/Express)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       ├── auth.js
│       └── admin.js
│
├── backend2/                      ← Blog Service (Node.js/Express)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── backend3/                      ← Blog Service (Node.js/Express)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── frontend-balancer/             ← Apache con mod_proxy_balancer
│   ├── Dockerfile
│   └── apache.conf
│
├── frontend1/                     ← React App (Vite)
│   ├── Dockerfile
│   ├── default.conf
│   └── src/
│
├── frontend2/                     ← React App (Vite)
│   ├── Dockerfile
│   ├── default.conf
│   └── src/
│
├── artillery/                     ← Pruebas de carga
│   ├── balanceador-50.yml
│   ├── balanceador-100.yml
│   ├── balanceador-500.yml
│   ├── balanceador-1000.yml
│   ├── balanceador-5000.yml
│   ├── balanceador-failover.yml
│   └── processor.js
│
├── resultados-artillery/          ← Resultados JSON de pruebas
│
└── mysql-init/
    └── init.sql
```

## Requisitos

- Docker v20.10+
- Docker Compose v2.0+
-make (opcional, para usar el Makefile)

## Configuración

Crear archivo `.env` en la raíz del proyecto:

```env
JWT_SECRET=tu_secret_aqui
COMPOSE_HTTP_TIMEOUT=600
DOCKER_CLIENT_TIMEOUT=600
```

## Despliegue

### 1. Clonar y entrar al directorio

```bash
cd proyecto1-balanceador-de-carga
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con los valores deseados
```

### 3. Construir e iniciar todos los servicios

```bash
docker-compose up --build
```

### 4. Verificar que todos los servicios estén corriendo

```bash
docker ps
```

## Puertos de acceso

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| Frontend Balanceador | 8090 | Balanceador Apache con React frontends |
| Backend Balanceador | 8080 | Balanceador Apache con API backends |
| Backend Auth | 3301 | Servicio de autenticación (directo) |
| MySQL | 3306 | Base de datos (directo) |
| Balancer Manager | 8080/balancer-manager | Panel de estado del balanceador |

## Algoritmos de balanceo

El proyecto soporta dos algoritmos configurables en `backend-balancer/apache.conf`:

### Round Robin (por solicitudes)
```apache
ProxySet lbmethod=byrequests
```

### Least Connections (por ocupación)
```apache
ProxySet lbmethod=bybusyness
```

Para cambiar el algoritmo, editar `backend-balancer/apache.conf` y reiniciar el contenedor:

```bash
docker-compose restart backend-balancer
```

## Escalado de backends

### Escalar backends de blog

```bash
docker-compose up --scale backend2=5 --scale backend3=5 -d
```

### Escalar frontends

```bash
docker-compose up --scale frontend1=3 --scale frontend2=3 -d
```

## Verificación del balanceo

### Probar distribución en backend

```bash
for i in {1..10}; do curl http://localhost:8080/health; echo ""; done
```

### Probar distribución en frontend

```bash
for i in {1..10}; do curl http://localhost:8090; echo ""; done
```

## Pruebas de carga con Artillery

### Ejecutar todas las pruebas

```bash
./run-usuarios-tests.sh
```

### Ejecutar prueba individual

```bash
# 50 usuarios
docker-compose run --rm artillery run --output /results/balanceador-50.json /scripts/balanceador-50.yml

# 100 usuarios
docker-compose run --rm artillery run --output /results/balanceador-100.json /scripts/balanceador-100.yml

# 500 usuarios
docker-compose run --rm artillery run --output /results/balanceador-500.json /scripts/balanceador-500.yml

# 1000 usuarios
docker-compose run --rm artillery run --output /results/balanceador-1000.json /scripts/balanceador-1000.yml

# 5000 usuarios
docker-compose run --rm artillery run --output /results/balanceador-5000.json /scripts/balanceador-5000.yml

# Prueba de failover
docker-compose run --rm artillery run --output /results/failover.json /scripts/balanceador-failover.yml
```

### Ver resultados

```bash
ls -lh resultados-artillery/
cat resultados-artillery/balanceador-100.json
```

## Comandos útiles

```bash
# Ver contenedores activos
docker ps

# Ver logs de un servicio
docker logs backend-balancer
docker logs frontend-balancer
docker logs backend2

# Reiniciar un servicio
docker-compose restart backend-balancer

# Detener todos los servicios
docker-compose down

# Reconstruir y levantar
docker-compose up --build -d

# Escalar servicios
docker-compose up --scale backend2=5 -d

# Ver uso de recursos
docker stats
```

## Arquitectura detallada

### Balanceador de Backend (Puerto 8080)

```
Cliente → backend-balancer:80 → /api/auth/* → backend1:3000
                              → /api/blog/* → balancer://blog_cluster
                                               ├── backend2:3000
                                               └── backend3:3000
```

### Balanceador de Frontend (Puerto 8090)

```
Cliente → frontend-balancer:80 → balancer://frontendcluster
                                      ├── frontend1:80
                                      └── frontend2:80
```

### Base de datos

Todos los backends comparten la misma instancia MySQL configurada con:
- Base de datos: `blog_db`
- Usuario: `root`
- Contraseña: `root`

## Notas

- Los backends son servicios Node.js/Express que exponen APIs REST
- El balanceo de carga se realiza mediante **Apache mod_proxy_balancer**
- Los frontends son aplicaciones React conectadas a los backends balanceados
- Artillery genera resultados JSON en `resultados-artillery/` para análisis posterior
