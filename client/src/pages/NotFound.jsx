import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>404 - Página no encontrada</h2>
    <p>Lo sentimos, esta página no existe.</p>
    <Link to="/">Volver al inicio</Link>
  </div>
);

export default NotFound;