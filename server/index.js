const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/plans', require('./routes/plan.routes'));
app.use('/api/login-logs', require('./routes/loginLog.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/auth', require('./routes/sessionRoutes'));

// Puerto
const PORT = process.env.PORT || 5001;

// Conexión y arranque
sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la base de datos establecida.');
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar con la base de datos:', err);
    process.exit(1);
  });