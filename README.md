# 🖥️ PROYECTO 1 — Balanceador de Carga con Apache y Docker
Proyecto de Curso 2026-1 · Universidad Autónoma de Occidente · Servicios Telemáticos

---

## 👩‍💻 Equipo de trabajo

| Integrante               | Rol en el proyecto |
|------------------------|------------------|
| Isabella Ortiz         | Infraestructura base + Docker + Balanceador |
| Isabella Cabezas       | Integración aplicación web (CybersecurityLab) |
| Samuel Sepúlveda       | Configuración de algoritmos de balanceo |
| Sebastián Cobos        | Pruebas de carga (Artillery) |
| Julián Viafara         | Métricas y análisis de resultados |
| Valentina Velastegui   | Documentación (README + informe IEEE) |

---

## 📌 Descripción del proyecto

Este proyecto implementa un **clúster de servidores web** utilizando contenedores Docker y un **balanceador de carga Apache**.

El sistema permite distribuir las peticiones de los usuarios entre múltiples servidores backend para:

- Mejorar el rendimiento
- Evitar sobrecarga en un solo servidor
- Aumentar la disponibilidad

---

## 🧩 Arquitectura del sistema

---

## 🛠️ Tecnologías utilizadas

- Docker
- Docker Compose
- Apache HTTP Server (mod_proxy_balancer)
- Nginx
- Linux (Ubuntu en Vagrant)

---

## 📁 Estructura del proyecto
proyecto1/
│
├── docker-compose.yml
├── README.md
│
├── balanceador/
│ ├── Dockerfile
│ └── apache.conf
│
├── backend1/
├── backend2/
├── backend3/
│ ├── Dockerfile
│ └── index.html


---

## ⚙️ Configuración realizada

### 🔹 1. Infraestructura base (Docker)

- Se crearon **3 contenedores backend** usando Nginx
- Cada backend sirve una página distinta para identificarlo
- Todos los servicios están conectados en una red interna de Docker

---

### 🔹 2. Balanceador de carga (Apache)

Se configuró Apache como **reverse proxy** usando:

- `mod_proxy`
- `mod_proxy_balancer`

Configuración principal:

```apache
<Proxy "balancer://cluster">
    BalancerMember http://backend1:80
    BalancerMember http://backend2:80
    BalancerMember http://backend3:80
    ProxySet lbmethod=byrequests
</Proxy>

ProxyPass "/" "balancer://cluster/"
ProxyPassReverse "/" "balancer://cluster/"
