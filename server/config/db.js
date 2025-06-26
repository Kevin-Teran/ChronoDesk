const { Sequelize } = require('sequelize');
const path = require('path');

// Carga variables de entorno desde el archivo correcto
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const sequelize = new Sequelize(
  process.env.DB_DATABASE || 'chrono-desk',
  process.env.DB_USERNAME || 'root',
  process.env.DB_PASSWORD || '', 
  {
    host: process.env.DB_HOST || '127.0.0.1', // Mejor usar IP para conexiones TCP
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectModule: require('mysql2'),
    logging: false,
    pool: { // 👈 Configuración recomendada para el pool de conexiones
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: { // 👈 Opciones globales para modelos
      timestamps: true, // Crea automáticamente createdAt/updatedAt
      freezeTableName: true // Evita la pluralización automática
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conectado a MySQL en:', 
      `${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE}`
    );
  })
  .catch(err => {
    console.error('\n❌ Error de conexión:');
    console.error('- Host:', process.env.DB_HOST || '127.0.0.1');
    console.error('- Puerto:', process.env.DB_PORT || 3306);
    console.error('- Usuario:', process.env.DB_USERNAME || 'root');
    console.error('- Código:', err.original?.code || err.code);
    console.error('- Error:', err.original?.message || err.message);

    // 👇 Sugerencias específicas basadas en errores comunes
    if (err.original?.code === 'ER_BAD_DB_ERROR') {
      console.error('\n⚠️  La base de datos no existe. Ejecuta:');
      console.error('CREATE DATABASE `chrono-desk`;');
    }
    
    if (err.original?.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Posibles soluciones:');
      console.error('1. Verifica que MySQL esté corriendo en XAMPP/MAMP');
      console.error('2. Confirma el puerto en la configuración de MySQL');
      console.error('3. Prueba con: mysql -u root -h 127.0.0.1 -P 3306');
    }

    process.exit(1);
  });

module.exports = sequelize;