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
