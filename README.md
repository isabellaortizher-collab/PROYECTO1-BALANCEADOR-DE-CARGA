# 🖥️ PROYECTO 1 — Balanceador de Carga con Apache y Docker

**Proyecto de Curso 2026-1 · Universidad Autónoma de Occidente · Servicios Telemáticos**

---

## 👩‍💻 Equipo de trabajo

| Integrante               | Rol en el proyecto                                   |
|--------------------------|------------------------------------------------------|
| Isabella Ortiz Hernández | Infraestructura base + Docker + Balanceador Frontend |
| Julián Viafara           | Integración aplicación web (CybersecurityLab)        |
| Samuel Sepúlveda         | Configuración de algoritmos de balanceo              |
| Sebastián Cobos          | Pruebas de carga (Artillery)                         |
| Isabela Cabezas         | Métricas y análisis de resultados                    |
| Valentina Velastegui     | Documentación (README + informe IEEE)                |

---

## 👩‍💻 Contribución individual — Isabella Ortiz Hernández

Mi responsabilidad principal fue el diseño e implementación de la infraestructura base del sistema, incluyendo:

- Virtualización con Vagrant
- Dockerización del entorno
- Balanceador de carga frontend y backend
- Integración del frontend de CybersecurityLab
- Configuración de múltiples nodos para alta disponibilidad

---

## 🧩 Alcance de mi trabajo

### 1. Despliegue de infraestructura base

- Configuración de máquina virtual Ubuntu 22.04 con Vagrant
- Instalación de Docker y Docker Compose
- Creación de la estructura inicial del proyecto

---

### 2. Implementación de clúster backend

Se desplegaron 3 servidores backend independientes usando Nginx:

- backend1
- backend2
- backend3

Cada nodo responde de forma individual para validar el balanceo.

---

### 3. Configuración de balanceador backend

Se implementó Apache HTTP Server utilizando:

- `mod_proxy`
- `mod_proxy_balancer`
- `lbmethod_byrequests`
- `lbmethod_bybusyness`

**Algoritmos implementados:**

- Round Robin
- Least Connections

---

### 4. Implementación de clúster frontend

Se integró el frontend real del proyecto **CybersecurityLab** mediante:

- frontend1
- frontend2
- frontend-balancer

**Características:**

- Balanceo de carga entre dos nodos frontend
- Uso de Apache como reverse proxy
- Integración de archivos compilados de React/Vite
- Soporte para SPA mediante `default.conf`

---

### 5. Orquestación con Docker Compose

Se centralizó toda la arquitectura mediante:

- Balanceador frontend
- Balanceador backend
- Frontends replicados
- Backends replicados

---

## 🧠 Decisiones de diseño

**Backend:** Se optó por múltiples nodos independientes para simular escalabilidad horizontal.

**Frontend:** Se replicó el frontend de CybersecurityLab en dos instancias para demostrar alta disponibilidad, distribución de carga y tolerancia a fallos.

---

## 🖥️ Entorno de trabajo

- Ubuntu 22.04 (Vagrant)
- Docker
- Docker Compose
- Apache HTTP Server
- Nginx
- IP servidor: `192.168.50.3`

---
## Vagrantfile
```
Vagrant.configure("2") do |config|
  config.vm.boot_timeout = 600

  # =========================
  # SERVIDOR
  # =========================
  config.vm.define "servidor" do |servidor|
    servidor.vm.box = "ubuntu/jammy64"
    servidor.vm.hostname = "servidor"
    servidor.vm.network "private_network", ip: "192.168.50.3"

    servidor.vm.provider "virtualbox" do |vb|
      vb.memory = 2048
      vb.cpus = 2
    end
  end

  # =========================
  # CLIENTE
  # =========================
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
## 🧩 Arquitectura general

```
Cliente
   │
   ▼
Frontend Balancer (Apache :8090)
   │
   ├── Frontend1 (CybersecurityLab)
   └── Frontend2 (CybersecurityLab)

Backend Balancer (Apache :8080)
   │
   ├── Backend1
   ├── Backend2
   └── Backend3
```

---

## 📁 Estructura del proyecto

```
proyecto1/
├── README.md
├── docker-compose.yml
│
├── balanceador/
│   ├── Dockerfile
│   └── apache.conf
│
├── backend1/
├── backend2/
├── backend3/
│   ├── Dockerfile
│   └── index.html
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

## ⚖️ Balanceo implementado

**Backend:**

```apache
ProxySet lbmethod=byrequests
```

**Frontend:**

```apache
BalancerMember http://frontend1:80
BalancerMember http://frontend2:80
```

---

## 🌐 Puertos de acceso

| Servicio             | Puerto |
|----------------------|--------|
| Frontend Balanceador | 8090   |
| Backend Balanceador  | 8080   |

---

## ▶️ Ejecución

```bash
sudo docker-compose up --build
```

---

## 🌍 Acceso al sistema

**Frontend:**

```
http://192.168.50.3:8090
```

**Backend:**

```
http://192.168.50.3:8080
```

---

## 🧪 Verificación de balanceo frontend

```bash
for i in {1..10}; do curl http://192.168.50.3:8090; echo ""; done
```

---

## 🧪 Verificación de balanceo backend

```bash
for i in {1..10}; do curl http://192.168.50.3:8080; echo ""; done
```

---

## 🛠️ Comandos útiles

```bash
sudo docker ps
sudo docker-compose down
sudo docker-compose up --build
sudo docker logs balanceador
sudo docker logs frontend-balancer
```

---

## 🎯 Resultados obtenidos

- Balanceador backend funcional
- Balanceador frontend funcional
- Integración real con CybersecurityLab
- Arquitectura escalable
- Simulación de alta disponibilidad
- Preparación para pruebas de carga y métricas

---

## 🚀 Extensión del proyecto

La infraestructura quedó preparada para:

- Integración completa backend
- Base de datos
- Pruebas con Artillery
- Métricas de rendimiento
- Informe técnico IEEE

---

## 🎯 Conclusión

Se implementó exitosamente una arquitectura distribuida basada en Apache, Docker y Nginx, capaz de balancear carga tanto en frontend como backend, integrando una aplicación web real (CybersecurityLab) dentro de un entorno escalable, modular y preparado para crecimiento futuro.

---

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