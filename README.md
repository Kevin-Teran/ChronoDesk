# ChronoDesk 🕒

ChronoDesk es una aplicación web moderna para gestionar tareas, eventos y tiempos con una interfaz intuitiva y potente. Ideal para equipos de trabajo o uso personal.

## Tecnologías

- **Frontend:** React.js, Vite, FullCalendar
- **Backend:** Node.js, Express, JWT, SQL (PostgreSQL/MySQL)
- **Autenticación:** JWT con roles (Usuario, Editor, Supervisor, Admin)
- **Notificaciones:** Campana y sistema de alertas push/email

## Funcionalidades

- Gestión de tareas con calendario visual
- Roles y permisos
- Estadísticas de usuarios y tareas
- Reseñas públicas y privadas
- Interfaz responsiva y accesible

## Estructura

- `/client`: React app
- `/server`: Node.js backend con base de datos SQL
- `/docs`: Documentación técnica

## Instalación

```bash
# Instalar dependencias
cd client && npm install
cd ../server && npm install

# Iniciar ambos servidores
cd .. && npm run start
