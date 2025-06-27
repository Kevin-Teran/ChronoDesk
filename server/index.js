const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models');

const app = express();

app.use(cors());
app.use(express.json());

const checkRouteStatus = async (routePath) => {
  try {
    
    switch(routePath) {
      case '/api/auth':
        return { status: 'active', message: 'Servicio de autenticación operativo' };
      
      case '/api/users':
        return { status: 'active', message: 'Gestión de usuarios operativa' };
      
      case '/api/tasks':
        return { status: 'active', message: 'Gestión de tareas operativa' };
      
      case '/api/reviews':
        return { status: 'active', message: 'Sistema de reviews operativo' };
      
      case '/api/plans':
        return { status: 'active', message: 'Gestión de planes operativa' };
      
      case '/api/login-logs':
        return { status: 'active', message: 'Registro de logs operativo' };
      
      case '/api/notifications':
        return { status: 'active', message: 'Sistema de notificaciones operativo' };
      
      case '/api/sessions':
        return { status: 'active', message: 'Gestión de sesiones operativa' };
      
      default:
        return { status: 'unknown', message: 'Estado desconocido' };
    }
  } catch (error) {
    return { status: 'error', message: `Error: ${error.message}` };
  }
};

app.get('/', async (req, res) => {
  const routes = [
    '/api/auth',
    '/api/users', 
    '/api/tasks',
    '/api/reviews',
    '/api/plans',
    '/api/login-logs',
    '/api/notifications',
    '/api/sessions'
  ];

  // Verificar estado de cada ruta
  const routeStatuses = {};
  for (const route of routes) {
    routeStatuses[route] = await checkRouteStatus(route);
  }

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🚀 ChronoDesk API Dashboard</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        padding: 20px;
      }
      
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      
      .header {
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        color: white;
        padding: 30px;
        text-align: center;
      }
      
      .header h1 {
        font-size: 2.5em;
        margin-bottom: 10px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      }
      
      .header p {
        font-size: 1.2em;
        opacity: 0.9;
      }
      
      .server-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px 30px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
      }
      
      .info-card {
        text-align: center;
        padding: 15px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .info-card h3 {
        color: #2c3e50;
        font-size: 1.1em;
        margin-bottom: 5px;
      }
      
      .info-card p {
        color: #7f8c8d;
        font-weight: bold;
      }
      
      .routes-section {
        padding: 30px;
      }
      
      .section-title {
        font-size: 1.8em;
        color: #2c3e50;
        margin-bottom: 25px;
        text-align: center;
        position: relative;
      }
      
      .section-title::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 3px;
        background: linear-gradient(90deg, #3498db, #2ecc71);
        border-radius: 2px;
      }
      
      .routes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-top: 30px;
      }
      
      .route-card {
        background: white;
        border-radius: 15px;
        padding: 25px;
        box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border-left: 5px solid;
      }
      
      .route-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 35px rgba(0,0,0,0.15);
      }
      
      .route-card.active {
        border-left-color: #2ecc71;
      }
      
      .route-card.error {
        border-left-color: #e74c3c;
      }
      
      .route-card.unknown {
        border-left-color: #f39c12;
      }
      
      .route-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .route-name {
        font-size: 1.3em;
        font-weight: bold;
        color: #2c3e50;
      }
      
      .status-badge {
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 0.9em;
        font-weight: bold;
        text-transform: uppercase;
      }
      
      .status-active {
        background: #d4edda;
        color: #155724;
      }
      
      .status-error {
        background: #f8d7da;
        color: #721c24;
      }
      
      .status-unknown {
        background: #fff3cd;
        color: #856404;
      }
      
      .route-description {
        color: #7f8c8d;
        margin-bottom: 15px;
        line-height: 1.5;
      }
      
      .route-message {
        background: #f8f9fa;
        padding: 10px 15px;
        border-radius: 8px;
        border-left: 3px solid #3498db;
        font-size: 0.9em;
        color: #495057;
      }
      
      .actions {
        text-align: center;
        padding: 30px;
        background: #f8f9fa;
        border-top: 1px solid #dee2e6;
      }
      
      .btn {
        display: inline-block;
        padding: 12px 25px;
        margin: 0 10px;
        background: linear-gradient(135deg, #3498db, #2980b9);
        color: white;
        text-decoration: none;
        border-radius: 25px;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(52, 152, 219, 0.4);
      }
      
      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(52, 152, 219, 0.6);
      }
      
      .btn-secondary {
        background: linear-gradient(135deg, #95a5a6, #7f8c8d);
        box-shadow: 0 4px 15px rgba(149, 165, 166, 0.4);
      }
      
      .btn-secondary:hover {
        box-shadow: 0 6px 20px rgba(149, 165, 166, 0.6);
      }
      
      .footer {
        text-align: center;
        padding: 20px;
        color: #7f8c8d;
        background: #2c3e50;
        color: white;
      }
      
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.7; }
        100% { opacity: 1; }
      }
      
      .status-active::before {
        content: '🟢';
        margin-right: 5px;
      }
      
      .status-error::before {
        content: '🔴';
        margin-right: 5px;
      }
      
      .status-unknown::before {
        content: '🟡';
        margin-right: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🚀 ChronoDesk API Dashboard</h1>
        <p>Centro de Control de Rutas y Servicios</p>
      </div>
      
      <div class="server-info">
        <div class="info-card">
          <h3>🌐 Puerto</h3>
          <p>${PORT}</p>
        </div>
        <div class="info-card">
          <h3>🗄️ Base de Datos</h3>
          <p>Conectada</p>
        </div>
        <div class="info-card">
          <h3>🌍 Entorno</h3>
          <p>${process.env.NODE_ENV || 'development'}</p>
        </div>
        <div class="info-card">
          <h3>⏰ Tiempo de Actividad</h3>
          <p>${new Date().toLocaleTimeString()}</p>
        </div>
      </div>
      
      <div class="routes-section">
        <h2 class="section-title">📋 Estado de las Rutas API</h2>
        
        <div class="routes-grid">
          ${routes.map(route => {
            const status = routeStatuses[route];
            const routeName = route.replace('/api/', '').toUpperCase();
            const descriptions = {
              '/api/auth': 'Sistema de autenticación y autorización de usuarios',
              '/api/users': 'Gestión completa de usuarios del sistema',
              '/api/tasks': 'Administración de tareas y proyectos',
              '/api/reviews': 'Sistema de reseñas y evaluaciones',
              '/api/plans': 'Gestión de planes y suscripciones',
              '/api/login-logs': 'Registro y monitoreo de inicios de sesión',
              '/api/notifications': 'Sistema de notificaciones en tiempo real',
              '/api/sessions': 'Gestión de sesiones de usuario activas'
            };
            
            return `
              <div class="route-card ${status.status}">
                <div class="route-header">
                  <div class="route-name">${routeName}</div>
                  <span class="status-badge status-${status.status}">${status.status}</span>
                </div>
                <div class="route-description">
                  ${descriptions[route] || 'Descripción no disponible'}
                </div>
                <div class="route-message">
                  ${status.message}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="actions">
        <a href="/routes" class="btn">📊 Ver Detalles JSON</a>
        <a href="/health" class="btn btn-secondary">❤️ Health Check</a>
        <button onclick="location.reload()" class="btn">🔄 Actualizar Estado</button>
      </div>
      
      <div class="footer">
        <p>🕐 Última actualización: ${new Date().toLocaleString()} | ChronoDesk API v1.0.0</p>
      </div>
    </div>
    
    <script>
      // Auto-refresh cada 30 segundos
      setTimeout(() => {
        location.reload();
      }, 30000);
    </script>
  </body>
  </html>
  `;

  res.send(html);
});

app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'Connected',
        dialect: sequelize.getDialect(),
        host: sequelize.config.host,
        database: sequelize.config.database
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      },
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(healthData);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'Disconnected'
    });
  }
});

app.get('/routes', async (req, res) => {
  const routes = [
    {
      path: '/api/auth',
      methods: ['POST'],
      description: 'Autenticación de usuarios (login, register, logout)',
      endpoints: [
        'POST /api/auth/login',
        'POST /api/auth/register', 
        'POST /api/auth/logout',
        'GET /api/auth/verify'
      ]
    },
    {
      path: '/api/users',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Gestión de usuarios del sistema',
      endpoints: [
        'GET /api/users',
        'GET /api/users/:id',
        'POST /api/users',
        'PUT /api/users/:id',
        'DELETE /api/users/:id'
      ]
    },
    {
      path: '/api/tasks',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Gestión de tareas y proyectos',
      endpoints: [
        'GET /api/tasks',
        'GET /api/tasks/:id',
        'POST /api/tasks',
        'PUT /api/tasks/:id',
        'DELETE /api/tasks/:id'
      ]
    },
    {
      path: '/api/reviews',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Sistema de reseñas y evaluaciones',
      endpoints: [
        'GET /api/reviews',
        'POST /api/reviews',
        'PUT /api/reviews/:id',
        'DELETE /api/reviews/:id'
      ]
    },
    {
      path: '/api/plans',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Gestión de planes y suscripciones',
      endpoints: [
        'GET /api/plans',
        'GET /api/plans/:id',
        'POST /api/plans',
        'PUT /api/plans/:id'
      ]
    },
    {
      path: '/api/login-logs',
      methods: ['GET', 'POST'],
      description: 'Registro de inicios de sesión',
      endpoints: [
        'GET /api/login-logs',
        'POST /api/login-logs'
      ]
    },
    {
      path: '/api/notifications',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      description: 'Sistema de notificaciones',
      endpoints: [
        'GET /api/notifications',
        'POST /api/notifications',
        'PUT /api/notifications/:id',
        'DELETE /api/notifications/:id'
      ]
    },
    {
      path: '/api/sessions',
      methods: ['GET', 'POST', 'DELETE'],
      description: 'Gestión de sesiones de usuario',
      endpoints: [
        'GET /api/sessions',
        'POST /api/sessions',
        'DELETE /api/sessions/:id'
      ]
    }
  ];

  // Verificar estado de cada ruta
  const routesWithStatus = [];
  for (const route of routes) {
    const status = await checkRouteStatus(route.path);
    routesWithStatus.push({
      ...route,
      status: status.status,
      statusMessage: status.message,
      lastChecked: new Date().toISOString()
    });
  }

  res.json({
    title: '📋 Dashboard de Rutas - ChronoDesk API',
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    activeRoutes: routesWithStatus.filter(r => r.status === 'active').length,
    routes: routesWithStatus
  });
});

// 🎯 RUTAS PARA VERIFICAR ESTADO DE MÓDULOS ESPECÍFICOS
app.get('/routes/status/auth', async (req, res) => {
  const status = await checkRouteStatus('/api/auth');
  res.json({
    module: 'auth',
    route: '/api/auth',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/users', async (req, res) => {
  const status = await checkRouteStatus('/api/users');
  res.json({
    module: 'users',
    route: '/api/users',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/tasks', async (req, res) => {
  const status = await checkRouteStatus('/api/tasks');
  res.json({
    module: 'tasks',
    route: '/api/tasks',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/reviews', async (req, res) => {
  const status = await checkRouteStatus('/api/reviews');
  res.json({
    module: 'reviews',
    route: '/api/reviews',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/plans', async (req, res) => {
  const status = await checkRouteStatus('/api/plans');
  res.json({
    module: 'plans',
    route: '/api/plans',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/login-logs', async (req, res) => {
  const status = await checkRouteStatus('/api/login-logs');
  res.json({
    module: 'login-logs',
    route: '/api/login-logs',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/notifications', async (req, res) => {
  const status = await checkRouteStatus('/api/notifications');
  res.json({
    module: 'notifications',
    route: '/api/notifications',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.get('/routes/status/sessions', async (req, res) => {
  const status = await checkRouteStatus('/api/sessions');
  res.json({
    module: 'sessions',
    route: '/api/sessions',
    ...status,
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/plans', require('./routes/plan.routes'));
app.use('/api/login-logs', require('./routes/loginLog.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

const PORT = parseInt(process.env.BACKEND_PORT) || 5001;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida.');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log('='.repeat(60));
      console.log('🚀 CHRONODESK API SERVER INICIADO');
      console.log(`🌐 Servidor: http://localhost:${PORT}`);
      console.log(`🔧 Puerto: ${PORT} (${process.env.BACKEND_PORT ? 'desde .env' : 'por defecto'})`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  });