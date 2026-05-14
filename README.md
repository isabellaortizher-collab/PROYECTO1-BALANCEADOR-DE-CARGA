# 🖥️ Proyecto 1 — Balanceador de Carga con Apache y Docker

> **Curso 2026-1 · Universidad Autónoma de Occidente · Servicios Telemáticos**

---

## 👥 Equipo de trabajo

| Integrante | Rol |
|---|---|
| Isabella Ortiz Hernández | Infraestructura base + Docker + Balanceador |
| Julián Viafara | Integración aplicación web (CybersecurityLab) |
| Samuel Sepúlveda | Configuración de algoritmos de balanceo |
| Sebastián Cobos | Pruebas de carga (Artillery) |
| Isabela Cabezas | Métricas y análisis de resultados |
| Valentina Velastegui | Documentación (README + informe IEEE) |

---

## 🏗️ Arquitectura general

```
                        [ Cliente ]
                             │
                             ▼
             Frontend Balancer (Apache :8090)
                    /                  \
             Frontend1             Frontend2
          (CybersecurityLab)   (CybersecurityLab)
                             │
                             ▼
             Backend Balancer (Apache :8080)
               /api/auth/*          /api/blog/*
                    │                /         \
                backend1        backend2     backend3
           (Auth — JWT/bcrypt)    (Blog Service — Round Robin)
                             │
                             ▼
               MySQL (XAMPP · host.docker.internal:3306)
```

---

## 📁 Estructura del proyecto

```
proyecto1/
├── README.md
├── docker-compose.yml
├── .env
│
├── backend-balancer/
│   ├── Dockerfile
│   └── apache.conf
│
├── backend1/                  ← Auth Service
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       ├── auth.js
│       └── admin.js
│
├── backend2/                  ← Blog Service (instancia 1)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── backend3/                  ← Blog Service (instancia 2)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── frontend-balancer/
│   ├── Dockerfile
│   └── apache.conf
│
├── frontend1/
│   ├── Dockerfile
│   ├── default.conf
│   ├── index.html
│   └── assets/
│
└── frontend2/
    ├── Dockerfile
    ├── default.conf
    ├── index.html
    └── assets/
```

---

## 🌐 Puertos de acceso

| Servicio | Puerto |
|---|---|
| Frontend Balanceador | `8090` |
| Backend Balanceador | `8080` |
| Backend Auth | `3301` |
| MySQL | `3306` |

---

## ▶️ Ejecución

```bash
docker-compose down
docker-compose up --build
```

---

## 🌍 Acceso al sistema

| Recurso | URL |
|---|---|
| Frontend | http://192.168.50.3:8090 |
| Backend | http://192.168.50.3:8080 |
| Balancer Manager | http://192.168.50.3:8080/balancer-manager |

---

## ⚖️ Configuración de balanceo

**Backend — algoritmo por solicitudes:**

```apache
ProxySet lbmethod=byrequests
```

**Frontend — dos nodos replicados:**

```apache
BalancerMember http://frontend1:80
BalancerMember http://frontend2:80
```

**Backend — enrutamiento por path:**

| Ruta | Destino |
|---|---|
| `/api/auth/*` | `backend1` |
| `/api/blog/*` | `backend2` / `backend3` |

---

## 🧪 Verificación de balanceo

**Frontend:**

```bash
for i in {1..10}; do curl http://192.168.50.3:8090; echo ""; done
```

**Backend:**

```bash
for i in {1..10}; do curl http://192.168.50.3:8080; echo ""; done
```

**Health check:**

```bash
for i in {1..10}; do curl http://192.168.50.3:8080/health; echo ""; done
```

---
## Pruebas de carga con Artillery
Para evaluar el comportamiento del balanceador de carga se implementaron pruebas con **Artillery**, una herramienta especializada en pruebas de rendimiento y carga para servicios HTTP. Las pruebas fueron ejecutadas desde un contenedor Docker dedicado, dentro de la misma red del proyecto, apuntando al balanceador frontend.
Los scripts para las pruebas se encuentran en la carpeta "artillery/", al terminar las pruebas, los resultados se guardan en formato .JSON en la carpeta "resultados-artillery/"

Los archivos de pruebas son:
artillery/balanceador-50.yml (prueba 50 usuarios)
artillery/balanceador-100.yml (prueba 100 usuarios)
artillery/balanceador-500.yml (prueba 500 usuarios)
artillery/balanceador-1000.yml (prueba 1000 usuarios
artillery/balanceador-5000.yml (prueba 5000 usuarios)
artillery/balanceador-failover.yml (prueba de caida del backend)

Para la ejecucion de las pruebas, se recomienda poner el siguiente comando antes de iniciar
```bash
export COMPOSE_HTTP_TIMEOUT=600
export DOCKER_CLIENT_TIMEOUT=600
```
De esta manera se aumenta el timeout del servicio docker para evitar fallos en la ejecucion de la prueba por timeout.

Tambien se proporciona el comando "./run-usuarios-tests.sh" el cual correra todas las pruebas de forma automatica.
Las pruebas se pueden correr de forma individual con: 

````bash
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-X.json \
  /scripts/balanceador-X.yml
```

Reemplazando X con el tipo de prueba a usar.
---
##Resultados Artillery

| Prueba        | Requests | HTTP 200 | Usuarios completados | Usuarios fallidos | Req/s |      Mean |      p95 |     p99 |
| ------------- | -------: | -------: | -------------------: | ----------------: | ----: | --------: | -------: | ------: |
| 50 usuarios   |      936 |      919 |                   33 |                17 |  27/s |    9.6 ms |  32.8 ms | 49.9 ms |
| 100 usuarios  |    2.831 |    2.831 |                   72 |                 0 |  56/s |    6.1 ms |    18 ms | 80.6 ms |
| 500 usuarios  |    2.708 |    2.591 |                   10 |               108 |  57/s | 1044.7 ms |  25.8 ms | 50.9 ms |
| 1000 usuarios |   19.714 |   19.564 |                  586 |               145 | 228/s | 4066.3 ms | 450.4 ms | 2231 ms |
| 5000 usuarios |   25.000 |   25.000 |                 5000 |                 0 | 187/s |    4.9 ms |    18 ms | 47.9 ms |
| Failover      |     1200 |     1200 |                 1200 |                 0 |  19/s |    1.4 ms |     3 ms |    6 ms |

La prueba mas importante es la de 5000 usuarios, que es la mayor carga que se le da al servidor, la cual tambien ha dado buenos resultados:

http.codes.200: 25000
http.requests: 25000
http.request_rate: 187/sec
vusers.created: 5000
vusers.completed: 5000
vusers.failed: 0
http.response_time.mean: 4.9 ms
http.response_time.p95: 18 ms
http.response_time.p99: 47.9 ms

Estas pruebas permitieron validar el comportamiento del balanceador de carga bajo distintos escenarios, el sistema mostros buena estabilidad, baja latencia en la mayoria de casos y pocos errores en estas. Especialmente en la prueba de 5000 usuarios, donde los 5000 usuarios se ejecutaron sin problema alguno 
---

## 🛠️ Comandos útiles

```bash
# Ver contenedores activos
docker ps

# Detener servicios
docker-compose down

# Reconstruir y levantar
docker-compose up --build

# Ver logs por servicio
docker logs balanceador
docker logs backend-balancer
docker logs backend2
docker logs frontend-balancer
```

---
<<<<<<< HEAD

## 📄 Vagrantfile
=======
## 🎯 Resultados obtenidos
>>>>>>> dcaa980 (Se añade prueba de 5000 usuarios en Artillery y tambien se actualiza el README.md)

```ruby
Vagrant.configure("2") do |config|
  config.vm.boot_timeout = 600

  # SERVIDOR
  config.vm.define "servidor" do |servidor|
    servidor.vm.box = "ubuntu/jammy64"
    servidor.vm.hostname = "servidor"
    servidor.vm.network "private_network", ip: "192.168.50.3"
    servidor.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end
  end

  # CLIENTE
  config.vm.define "cliente" do |cliente|
    cliente.vm.box = "ubuntu/jammy64"
    cliente.vm.hostname = "cliente"
    cliente.vm.network "private_network", ip: "192.168.50.2"
    cliente.vm.provider "virtualbox" do |vb|
      vb.memory = 1024
      vb.cpus = 1
    end
  end
end
```

---

## 🔧 Entorno de trabajo

| Componente | Detalle |
|---|---|
| Sistema operativo | Ubuntu 22.04 (Vagrant) |
| Virtualización | VirtualBox + Vagrant |
| Contenedores | Docker + Docker Compose |
| Servidor web | Apache HTTP Server + Nginx |
| IP del servidor | `192.168.50.3` |

---

---

# 👩‍💻 Contribuciones individuales

---

## Isabella Ortiz Hernández — Infraestructura base + Docker + Balanceador

### Responsabilidades

- Virtualización con Vagrant
- Dockerización del entorno
- Configuración del balanceador de carga (frontend y backend)
- Integración del frontend de CybersecurityLab
- Configuración de múltiples nodos para alta disponibilidad

### Clúster backend

Se desplegaron **3 servidores backend independientes** con Nginx:

- `backend1`
- `backend2`
- `backend3`

Cada nodo responde de forma individual para validar el balanceo.

### Balanceador backend (Apache HTTP Server)

Módulos utilizados:

```apache
mod_proxy
mod_proxy_balancer
lbmethod_byrequests
lbmethod_bybusyness
```

Algoritmos implementados: **Round Robin** y **Least Connections**.

### Clúster frontend

Se integró el frontend de **CybersecurityLab** en dos instancias:

- `frontend1` — archivos compilados React/Vite
- `frontend2` — archivos compilados React/Vite
- `frontend-balancer` — Apache como reverse proxy con soporte SPA

### Resultados obtenidos

- ✅ Balanceador backend funcional
- ✅ Balanceador frontend funcional
- ✅ Integración real con CybersecurityLab
- ✅ Arquitectura escalable
- ✅ Simulación de alta disponibilidad
- ✅ Preparada para pruebas de carga y métricas

---

## Julián Viafara — Integración de CybersecurityLab

### Responsabilidades

Adaptación de la aplicación monolítica original para operar correctamente dentro del entorno Dockerizado con balanceadores de carga.

### 1. Reestructuración backend (monolito → microservicios)

El backend original era un único servidor Express que manejaba autenticación y blog simultáneamente. Bajo alta concurrencia esto representa un cuello de botella, ya que:

- Las operaciones de **autenticación** (bcrypt, JWT) son intensivas en **CPU**.
- Las operaciones del **blog** son intensivas en **I/O**.

**Solución:** separación en dos servicios independientes.

| Contenedor | Función | Puerto |
|---|---|---|
| `backend1` | Servicio de autenticación | `3000` |
| `backend2` | Blog Service (instancia 1) | `3000` |
| `backend3` | Blog Service (instancia 2) | `3000` |

Los tres comparten `JWT_SECRET` para que los tokens emitidos por Auth sean verificables por el servicio Blog.

### 2. Configuración Apache como API Gateway

```apache
# Autenticación → backend1
ProxyPass /api/auth/ http://backend1:3000/api/auth/
ProxyPassReverse /api/auth/ http://backend1:3000/api/auth/

# Blog → backend2 y backend3 (Round Robin)
<Proxy balancer://blog_cluster>
    BalancerMember http://backend2:3000
    BalancerMember http://backend3:3000
    ProxySet lbmethod=byrequests
</Proxy>
ProxyPass /api/blog/ balancer://blog_cluster/api/blog/
ProxyPass /api/blog balancer://blog_cluster/api/blog
```

### 3. Problemas resueltos

| Error | Causa | Solución |
|---|---|---|
| CORS bloqueado | Headers duplicados entre Apache y Express | CORS gestionado solo por Apache |
| OPTIONS preflight → 404 | Módulos no habilitados | Añadir `mod_headers` y `mod_rewrite` vía `sed` |
| 404 en `/api/blog` | Trailing slash en ProxyPass | Doble regla con y sin slash |
| 401 en posts | `JWT_SECRET` ausente en backend2/backend3 | Añadir en `docker-compose.yml` |
| Variables VITE ignoradas | Variables en runtime no llegan a Vite | Migrar a `build.args` en Docker Compose |

### 4. Integración frontend React/Vite

Se reemplazó la instancia única de axios por dos instancias nombradas:

```js
// Antes
export default axios.create({ baseURL: "http://192.168.50.3:8080" });

// Después
export const authApi = axios.create({ baseURL: "http://192.168.50.3:8080/api/auth" });
export const blogApi = axios.create({ baseURL: "http://192.168.50.3:8080/api/blog" });
```

Variables de entorno en `docker-compose.yml` (tiempo de build, no runtime):

```yaml
build:
  context: ./frontend1
  args:
    VITE_AUTH_URL: http://192.168.50.3:8080/api/auth
    VITE_BLOG_URL: http://192.168.50.3:8080/api/blog
```

### 5. Tecnologías utilizadas

- Docker + Docker Compose
- Apache HTTP Server (`httpd:2.4`)
- Node.js + Express
- React + Vite
- MySQL (XAMPP)
- JWT + bcryptjs

---

## 🎯 Conclusión

Se implementó exitosamente una arquitectura distribuida basada en **Apache**, **Docker** y **Nginx**, capaz de balancear carga tanto en frontend como en backend, integrando una aplicación web real (**CybersecurityLab**) dentro de un entorno escalable, modular y preparado para crecimiento futuro. La separación del monolito en microservicios permite escalar cada servicio de forma independiente según su naturaleza (CPU-bound vs I/O-bound).

---

<<<<<<< HEAD
> 📍 Universidad Autónoma de Occidente · Servicios Telemáticos · 2026-1
=======
👨‍💻 Contribución individual — Julián Viafara
Mi responsabilidad principal fue la integración completa de la aplicación web CybersecurityLab dentro de la arquitectura distribuida del proyecto, adaptando una aplicación monolítica local para operar correctamente dentro del entorno Dockerizado con balanceadores de carga.

🧩 Alcance del trabajo realizado
1. Reestructuración de arquitectura backend
La aplicación original contaba con un único servidor Express que manejaba autenticación y blog simultáneamente. Se identificó este monolito como el cuello de botella hipotético bajo alta concurrencia: las operaciones de autenticación (bcrypt, JWT) son intensivas en CPU, mientras que las operaciones del blog son intensivas en I/O, compitiendo por el mismo proceso.
La solución fue separar el backend en dos servicios independientes:
ContenedorFunciónPuerto internobackend1Servicio de autenticación3000backend2Instancia 1 del servicio Blog3000backend3Instancia 2 del servicio Blog3000
Cada backend tiene su propio server.js, db.js, middleware y rutas, compartiendo únicamente el JWT_SECRET para que los tokens emitidos por el servicio Auth sean verificables por el servicio Blog.

2. Configuración del balanceador backend (Apache)
Se configuró Apache HTTP Server como API Gateway y balanceador de carga con enrutamiento basado en path:
RutaDestino/api/auth/*backend1/api/blog/*backend2/backend3
Problemas resueltos durante la configuración:

Habilitación correcta de módulos Apache (mod_proxy, mod_proxy_balancer, mod_headers, mod_rewrite) mediante sed sobre httpd.conf, ya que a2enmod no está disponible en la imagen httpd:2.4.
Corrección de error CORS: Apache y Express duplicaban el header Access-Control-Allow-Origin. Solución: CORS gestionado exclusivamente por Apache, eliminado de los tres backends.
Corrección de preflight OPTIONS: Apache respondía 404 a las solicitudes OPTIONS. Solución: regla RewriteRule para retornar 204 inmediatamente sin proxying.
Corrección de trailing slash en ProxyPass: Apache no matcheaba /api/blog sin slash final. Solución: dos reglas ProxyPass, con y sin slash.


3. Integración del frontend React/Vite
El frontend original usaba un único axios con baseURL apuntando al backend monolítico. Se realizaron los siguientes cambios:

Reemplazo del export default de axios por dos instancias nombradas: authApi y blogApi.
Actualización de todos los componentes y páginas para usar la instancia correcta según el tipo de operación.
Corrección de variables de entorno Vite: las variables VITE_* deben inyectarse en tiempo de build, no en runtime. Se migraron de environment a build.args en Docker Compose, y se declararon como ARG/ENV en el Dockerfile.


4. Dockerización de servicios backend
Se desarrollaron Dockerfiles para los tres backends Node.js, y se configuró docker-compose.yml con:

Variables de entorno correctas por servicio incluyendo JWT_SECRET en los tres backends.
Conectividad a MySQL local mediante host.docker.internal.
Red interna proyecto_net compartida entre todos los servicios.


5. Depuración y resolución de errores end-to-end
Durante la integración se identificaron y resolvieron los siguientes errores en secuencia:

CORS bloqueado → headers duplicados entre Apache y Express → eliminado CORS de Express.
OPTIONS preflight fallando → módulos mod_headers y mod_rewrite no habilitados en el Dockerfile → añadidos vía sed.
404 en /api/blog → mismatch de trailing slash en ProxyPass → doble regla con y sin slash.
401 en posts → JWT_SECRET ausente en backend2 y backend3 → añadido en docker-compose.yml.
Variables VITE ignoradas → env vars en runtime no llegan a Vite → migradas a build args.


🏗️ Arquitectura final implementada
Cliente
   │
   ▼
Frontend Balancer (Apache :8090)
   │
   ├── frontend1 (React/Vite)
   └── frontend2 (React/Vite)
          │
          ▼
Backend Balancer (Apache :8080)
   │
   ├── /api/auth/* → backend1 (Auth Service — JWT + bcrypt)
   │
   ├── /api/blog/* → backend2 (Blog Service)
   └── /api/blog/* → backend3 (Blog Service) ← Round Robin
          │
          ▼
   MySQL (XAMPP · host.docker.internal:3306)

⚙️ Tecnologías utilizadas

Docker + Docker Compose
Apache HTTP Server (httpd:2.4)
Node.js + Express
React + Vite
MySQL (XAMPP)
JWT + bcryptjs


🌐 Puertos utilizados
ServicioPuertoFrontend Balancer8090Backend Balancer8080Backend Auth3301MySQL3306

▶️ Ejecución
bashdocker-compose down
docker-compose up --build
🌍 Acceso al sistema
RecursoURLFrontendhttp://192.168.50.3:8090Backendhttp://192.168.50.3:8080Balancer Managerhttp://192.168.50.3:8080/balancer-manager

🧪 Verificación de balanceo backend
bashfor i in {1..10}; do curl http://192.168.50.3:8080/health; echo ""; done

🛠️ Comandos útiles
bashdocker ps
docker-compose down
docker-compose up --build
docker logs backend-balancer
docker logs backend2
docker logs frontend-balancer

📁 Estructura del proyecto
proyecto1/
├── README.md
├── docker-compose.yml
├── .env
│
├── backend-balancer/
│   ├── Dockerfile
│   └── apache.conf
│
├── backend1/          ← Auth Service
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       ├── auth.js
│       └── admin.js
│
├── backend2/          ← Blog Service (instancia 1)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── backend3/          ← Blog Service (instancia 2)
│   ├── Dockerfile
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   └── routes/
│       └── posts.js
│
├── frontend-balancer/
│   ├── Dockerfile
│   └── apache.conf
│
├── frontend1/
│   ├── Dockerfile
│   └── src/
│
└── frontend2/
    ├── Dockerfile
    └── src/
>>>>>>> dcaa980 (Se añade prueba de 5000 usuarios en Artillery y tambien se actualiza el README.md)
