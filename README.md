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

> 📍 Universidad Autónoma de Occidente · Servicios Telemáticos · 2026-1
