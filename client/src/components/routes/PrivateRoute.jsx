import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClipLoader from 'react-spinners/ClipLoader';

const PrivateRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  console.log('PrivateRoute - Estado actual:', {
    loading,
    isAuthenticated,
    user: user ? { id: user.id, role: user.role } : null,
    requiredRole,
    currentPath: location.pathname
  });

  // Mostrar spinner mientras se carga el estado de autenticación
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <ClipLoader color="#3B82F6" loading={true} size={50} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verificando autenticación...
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Redirigir al login si no está autenticado
  if (!isAuthenticated) {
    console.log('Usuario no autenticado, redirigiendo a login');
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar rol requerido si se especifica
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Acceso denegado. Rol requerido: ${requiredRole}, rol actual: ${user?.role}`);
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location, requiredRole, currentRole: user?.role }} 
        replace 
      />
    );
  }

  // Usuario autenticado y con permisos correctos
  return children;
};

export default PrivateRoute;