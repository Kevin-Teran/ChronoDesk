import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Eye, EyeOff } from 'lucide-react';
import ClipLoader from 'react-spinners/ClipLoader';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginForm = () => {
  const [form, setForm] = useState({
    identifier: '',
    password: '',
    rememberMe: false,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login, isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Función para determinar la ruta de redirección - CORREGIDA
  const getRedirectPath = useCallback(() => {
    const from = location.state?.from?.pathname;
    
    if (from && from !== '/login') {
      return from;
    }
    
    // CAMBIO: Siempre redirigir a /dashboard sin importar el rol
    return '/dashboard';
  }, [location.state]);

  // Manejar mensajes de estado (como después del registro)
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      // Limpiar el estado para evitar mostrar el mensaje repetidamente
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Redireccionar si ya está autenticado
  useEffect(() => {
    console.log('LoginForm useEffect - Estado auth:', {
      isAuthenticated,
      user: user ? { id: user.id, role: user.role } : null,
      authLoading
    });

    // Solo redirigir si no está cargando y está autenticado
    if (!authLoading && isAuthenticated && user) {
      const redirectTo = getRedirectPath();
      console.log('Usuario ya autenticado, redirigiendo a:', redirectTo);
      
      toast.success('¡Ya tienes una sesión activa!');
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, authLoading, navigate, getRedirectPath]);

  const validate = () => {
    const errors = {};
    
    if (!form.identifier.trim()) {
      errors.identifier = 'El usuario o email es requerido.';
    }
    
    if (!form.password) {
      errors.password = 'La contraseña es requerida.';
    } else if (form.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Limpiar error específico cuando el usuario corrige
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    setLoading(true);
    setFormErrors({});
    
    try {
      console.log('Intentando login con datos:', {
        identifier: form.identifier.trim(),
        rememberMe: form.rememberMe
      });
      
      const result = await login({
        identifier: form.identifier.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      });

      console.log('Login exitoso:', result);
      
      toast.success('¡Bienvenido de vuelta!');
      
      // La redirección se manejará en el useEffect
      
    } catch (err) {
      console.error('Login error:', err);
      
      let errorMessage = 'Error al iniciar sesión. Por favor intenta de nuevo.';
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || 'Credenciales inválidas.';
      } else if (err.response?.status === 403) {
        errorMessage = err.response.data?.error || 'Acceso denegado. Verifica tu cuenta.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      } else if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.join(', ');
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      
      // Limpiar la contraseña en caso de error
      setForm(prev => ({ ...prev, password: '' }));
      
    } finally {
      setLoading(false);
    }
  };

  // Mostrar spinner mientras se verifica la autenticación inicial
  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 scroll-smooth">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <ClipLoader color="#3B82F6" loading={true} size={50} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verificando autenticación...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Si ya está autenticado, mostrar mensaje de redirección
  if (isAuthenticated && user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <ClipLoader color="#3B82F6" loading={true} size={50} />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Redirigiendo al dashboard...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300">
          <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
            Iniciar Sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Usuario o Email */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">
                Usuario o correo electrónico *
              </label>
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                  formErrors.identifier ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingresa tu usuario o email"
                autoComplete="username"
                disabled={loading}
              />
              {formErrors.identifier && (
                <p className="text-red-600 text-xs mt-1">{formErrors.identifier}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-gray-700 dark:text-gray-200 text-sm font-medium mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute top-2 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Recordar sesión */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  name="rememberMe"
                  checked={form.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="ml-2 text-gray-700 dark:text-gray-200 text-sm">
                  Mantener sesión activa
                </label>
              </div>
              
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => navigate('/forgot-password')}
                disabled={loading}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Botón de submit */}
            <div className="pt-2">
              {loading ? (
                <div className="flex justify-center items-center space-x-2 py-2">
                  <ClipLoader color="#3B82F6" loading={loading} size={20} />
                  <span className="text-gray-600 dark:text-gray-400">Iniciando sesión...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  disabled={loading}
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </form>

          {/* Enlaces adicionales */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿No tienes una cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                disabled={loading}
              >
                Regístrate aquí
              </button>
            </p>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Al iniciar sesión, aceptas nuestros{' '}
                <button
                  onClick={() => navigate('/terms')}
                  className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                  disabled={loading}
                >
                  Términos de Servicio
                </button>
                {' '}y{' '}
                <button
                  onClick={() => navigate('/privacy')}
                  className="text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
                  disabled={loading}
                >
                  Política de Privacidad
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ToastContainer 
        position="top-center" 
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default LoginForm;