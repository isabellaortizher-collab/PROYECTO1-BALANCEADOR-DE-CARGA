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

<img width="1698" height="926" alt="Diagrama de arquitectura" src="https://github.com/user-attachments/assets/e00e8006-322b-4a65-99c7-58034424a369" />


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
├── frontend2/
│   ├── Dockerfile
│   ├── default.conf
│   ├── index.html
│   └── assets/
│
├── artillery/
│   ├── balanceador-50.yml
│   ├── balanceador-100.yml
│   ├── balanceador-500.yml
│   ├── balanceador-1000.yml
│   ├── balanceador-5000.yml
│   └── balanceador-failover.yml
│
├── resultados-artillery/
│   └── *.json
│
└── run-usuarios-tests.sh
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

## 🌐 Puertos de acceso

| Servicio | Puerto |
|---|---|
| Frontend Balanceador | `8090` |
| Backend Balanceador | `8080` |
| Backend Auth | `3301` |
| MySQL | `3306` |

---

## 📄 Vagrantfile

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

## 🔫 Pruebas de carga con Artillery

Para evaluar el comportamiento del balanceador se implementaron pruebas con **Artillery**, una herramienta especializada en pruebas de rendimiento para servicios HTTP. Las pruebas se ejecutaron desde un contenedor Docker dedicado dentro de la misma red del proyecto, apuntando al balanceador frontend.

Los scripts están en `artillery/` y los resultados se guardan en formato `.json` en `resultados-artillery/`.

### Archivos de prueba

| Archivo | Escenario |
|---|---|
| `artillery/balanceador-50.yml` | 50 usuarios simultáneos |
| `artillery/balanceador-100.yml` | 100 usuarios simultáneos |
| `artillery/balanceador-500.yml` | 500 usuarios simultáneos |
| `artillery/balanceador-1000.yml` | 1000 usuarios simultáneos |
| `artillery/balanceador-5000.yml` | 5000 usuarios simultáneos |
| `artillery/balanceador-failover.yml` | Prueba de caída del backend |

### Preparación antes de ejecutar

```bash
export COMPOSE_HTTP_TIMEOUT=600
export DOCKER_CLIENT_TIMEOUT=600
```

### Ejecutar todas las pruebas automáticamente

```bash
./run-usuarios-tests.sh
```

### Ejecutar una prueba individual

```bash
sudo -E docker-compose run --rm artillery run \
  --output /results/balanceador-X.json \
  /scripts/balanceador-X.yml
```

> Reemplazar `X` con el escenario deseado: `50`, `100`, `500`, `1000`, `5000` o `failover`.

---

## 📊 Resultados Artillery

| Prueba | Requests | HTTP 200 | Completados | Fallidos | Req/s | Mean | p95 | p99 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 50 usuarios | 936 | 919 | 33 | 17 | 27/s | 9.6 ms | 32.8 ms | 49.9 ms |
| 100 usuarios | 2.831 | 2.831 | 72 | 0 | 56/s | 6.1 ms | 18 ms | 80.6 ms |
| 500 usuarios | 2.708 | 2.591 | 10 | 108 | 57/s | 1044.7 ms | 25.8 ms | 50.9 ms |
| 1000 usuarios | 19.714 | 19.564 | 586 | 145 | 228/s | 4066.3 ms | 450.4 ms | 2231 ms |
| **5000 usuarios** | **25.000** | **25.000** | **5000** | **0** | **187/s** | **4.9 ms** | **18 ms** | **47.9 ms** |
| Failover | 1200 | 1200 | 1200 | 0 | 19/s | 1.4 ms | 3 ms | 6 ms |

### Prueba destacada — 5000 usuarios

```
http.codes.200:              25000
http.requests:               25000
http.request_rate:           187/sec
vusers.created:              5000
vusers.completed:            5000
vusers.failed:               0
http.response_time.mean:     4.9 ms
http.response_time.p95:      18 ms
http.response_time.p99:      47.9 ms
```

Las pruebas validaron la estabilidad del sistema bajo distintos escenarios: baja latencia en la mayoría de los casos y mínimos errores. Destaca especialmente el escenario de 5000 usuarios, donde los 5000 usuarios completaron sin ningún fallo.

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

El backend original era un único servidor Express que manejaba autenticación y blog simultáneamente. Bajo alta concurrencia esto representa un cuello de botella:

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
ProxyPass /api/blog  balancer://blog_cluster/api/blog
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

## Sebastián Cobos — Pruebas de carga con Artillery

### Responsabilidades

Diseño e implementación de pruebas de rendimiento sobre la infraestructura desplegada, usando Artillery desde un contenedor Docker dedicado dentro de la red del proyecto.

### Escenarios evaluados

Se diseñaron 6 escenarios para cubrir desde carga ligera hasta alta concurrencia y tolerancia a fallos: 50, 100, 500, 1000 y 5000 usuarios simultáneos, más una prueba de failover para simular la caída de un nodo backend.

### Hallazgos principales

- **0 fallos** en las pruebas de 100, 5000 usuarios y failover.
- **5000 usuarios** fue el escenario de mayor éxito: 25.000 requests completados con latencia media de 4.9 ms.
- **500 usuarios** mostró degradación en latencia media (1044.7 ms), punto de saturación a investigar.
- **Failover** confirmó la tolerancia a fallos: 1200/1200 requests exitosos con latencia de 1.4 ms.

---

## 🎯 Conclusión

Se implementó exitosamente una arquitectura distribuida basada en **Apache**, **Docker** y **Nginx**, capaz de balancear carga tanto en frontend como en backend, integrando una aplicación web real (**CybersecurityLab**). La separación del monolito en microservicios permite escalar cada servicio de forma independiente según su naturaleza (CPU-bound vs I/O-bound). Las pruebas de carga con Artillery validaron la estabilidad del sistema bajo alta concurrencia, con resultados destacados en el escenario de 5000 usuarios simultáneos.

---

> 📍 Universidad Autónoma de Occidente · Servicios Telemáticos · 2026-1
