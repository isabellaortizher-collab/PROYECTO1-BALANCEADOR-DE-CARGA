# 🖥️ PROYECTO 1 — Balanceador de Carga con Apache y Docker
Proyecto de Curso 2026-1 · Universidad Autónoma de Occidente · Servicios Telemáticos

---

## 👩‍💻 Equipo de trabajo

| Integrante               | Rol en el proyecto |
|------------------------|------------------|
| Isabella Ortiz         | Infraestructura base + Docker + Balanceador |
| Julian Viafara         | Integración aplicación web (CybersecurityLab) |
| Samuel Sepúlveda       | Configuración de algoritmos de balanceo |
| Sebastián Cobos        | Pruebas de carga (Artillery) |
| Isabella Cabezas       | Métricas y análisis de resultados |
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


Cliente → Balanceador (Apache) → Backends (3 servidores Nginx)

---

## 🛠️ Tecnologías utilizadas

- Docker  
- Docker Compose  
- Apache HTTP Server (mod_proxy_balancer)  
- Nginx  
- Linux (Ubuntu en Vagrant)  

---

## 📁 Estructura del proyecto

```
proyecto1/
│
├── docker-compose.yml
├── README.md
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

```
---

## ⚙️ Configuración realizada

### 🔹 Infraestructura base (Docker)

- 3 contenedores backend con Nginx  
- Cada backend muestra una página distinta  
- Todos conectados en red interna Docker  

---

### 🔹 Balanceador de carga (Apache)

Configurado como reverse proxy con:

- mod_proxy  
- mod_proxy_balancer  


<Proxy "balancer://cluster">
BalancerMember http://backend1:80

BalancerMember http://backend2:80

BalancerMember http://backend3:80

ProxySet lbmethod=byrequests
</Proxy>

ProxyPass "/" "balancer://cluster/"
ProxyPassReverse "/" "balancer://cluster/"


---

## ▶️ Cómo ejecutar el proyecto

### 1. Clonar repositorio


git clone <URL_DEL_REPO>
cd proyecto1


---

### 2. Ejecutar contenedores


sudo docker-compose up --build


---

### 3. Acceder

Abrir en navegador:


http://192.168.50.3:8080


---

## 🧪 Verificación

- Recargar la página varias veces  
- Debe cambiar entre backend1, backend2 y backend3  

---

## ✅ Estado actual

- Balanceador funcionando  
- 3 backends activos  
- Docker funcionando  
- Acceso web correcto  

---

## ⚠️ Pendiente (equipo)

### Integrar aplicación real
Usar:
https://github.com/julianviafara-arch/CybersecurityLab

---

### Cambiar algoritmo
Modificar:


ProxySet lbmethod=byrequests


---

### Pruebas de carga
Usar Artillery con múltiples usuarios

---

### Métricas
Analizar:

- Latencia  
- Throughput  
- Errores  

---

### Documentación
- README final  
- Informe IEEE  

---

## 🛠️ Comandos útiles


sudo docker ps
sudo docker logs balanceador
sudo docker-compose down


---

## 🎯 Conclusión

Se implementó un sistema de balanceo de carga funcional con Docker y Apache, listo para escalabilidad, pruebas de rendimiento e integración de una aplicación real.

