import React, { useState, useEffect } from 'react';
import { registerUser, validateSecretKey } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Eye, EyeOff, Shield, User, Mail, Phone, Lock, Key } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente de Slider de Carga
const LoadingSlider = ({ isVisible, progress = 0 }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Creando tu cuenta
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Por favor espera mientras procesamos tu información...
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegisterForm = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    secretKey: '',
    role: 'user',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [secretKeyValid, setSecretKeyValid] = useState(null);
  const [secretKeyLoading, setSecretKeyLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuthentication = () => {
      try {
        // Buscar token en localStorage
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        // Verificar si hay sesión activa
        if (token && user) {
          setIsAuthenticated(true);
          toast.info('Ya tienes una sesión activa. Redirigiendo...');
          setTimeout(() => {
            navigate('/dashboard'); // o la ruta principal de tu aplicación
          }, 1500);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuthentication();
  }, [navigate]);

  // Validar clave secreta cuando cambie
  useEffect(() => {
    if (form.secretKey.trim() !== '') {
      setSecretKeyLoading(true);
      const timeoutId = setTimeout(() => {
        validateSecretKey(form.secretKey)
          .then((response) => {
            setAvailableRoles(response.roles || []);
            setSecretKeyValid(true);
            setForm(prev => ({ ...prev, role: response.roles[0] || 'user' }));
            toast.success(`Clave secreta válida para: ${response.planName || 'Plan'}`);
          })
          .catch((error) => {
            setAvailableRoles([]);
            setSecretKeyValid(false);
            setForm(prev => ({ ...prev, role: 'user' }));
            toast.error(error.response?.data?.error || 'Clave secreta inválida.');
          })
          .finally(() => {
            setSecretKeyLoading(false);
          });
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setAvailableRoles([]);
      setSecretKeyValid(null);
      setSecretKeyLoading(false);
      setForm(prev => ({ ...prev, role: 'user' }));
    }
  }, [form.secretKey]);

  // Validación técnica mejorada
  const validate = () => {
    const errors = {};
    
    // Validación de nombre (solo letras y espacios)
    if (!form.firstName.trim()) {
      errors.firstName = 'El nombre es requerido.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,30}$/.test(form.firstName.trim())) {
      errors.firstName = 'El nombre debe contener solo letras y tener entre 2-30 caracteres.';
    }
    
    // Validación de apellido
    if (!form.lastName.trim()) {
      errors.lastName = 'El apellido es requerido.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,30}$/.test(form.lastName.trim())) {
      errors.lastName = 'El apellido debe contener solo letras y tener entre 2-30 caracteres.';
    }
    
    // Validación de username mejorada
    if (!form.username.trim()) {
      errors.username = 'El nombre de usuario es requerido.';
    } else if (!/^[a-zA-Z0-9._-]{3,20}$/.test(form.username.trim())) {
      errors.username = 'El username debe tener 3-20 caracteres alfanuméricos, puntos, guiones o guiones bajos.';
    }
    
    // Validación de email RFC 5322 compliant
    if (!form.email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(form.email.trim())) {
      errors.email = 'Formato de correo electrónico inválido.';
    }
    
    // Validación de teléfono internacional mejorada
    if (!form.phone.trim()) {
      errors.phone = 'El teléfono es requerido.';
    } else if (!/^(\+?[1-9]\d{1,14}|[1-9]\d{6,14})$/.test(form.phone.replace(/[\s\-\(\)]/g, ''))) {
      errors.phone = 'Formato de teléfono inválido. Use formato internacional (+123456789) o nacional.';
    }
    
    // Validación de contraseña robusta
    if (!form.password) {
      errors.password = 'La contraseña es requerida.';
    } else {
      const password = form.password;
      const minLength = 8;
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      
      if (password.length < minLength) {
        errors.password = `La contraseña debe tener al menos ${minLength} caracteres.`;
      } else if (!hasLower || !hasUpper || !hasNumber) {
        errors.password = 'La contraseña debe tener al menos una mayúscula, una minúscula y un número.';
      } else if (password.length < 12 && !hasSpecial) {
        errors.password = 'Para contraseñas menores a 12 caracteres, debe incluir al menos un símbolo especial.';
      }
    }
    
    // Validación de rol
    if (secretKeyValid && !form.role) {
      errors.role = 'El rol es requerido cuando se usa una clave secreta válida.';
    }
    
    return errors;
  };

  // Evaluación de fortaleza de contraseña mejorada
  const evaluatePasswordStrength = (password) => {
    if (password.length === 0) return '';
    
    let score = 0;
    let feedback = [];
    
    // Longitud
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    // Complejidad de caracteres
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Patrones comunes (penalización)
    if (/^(.)\1+$/.test(password)) score -= 2; // Todos los caracteres iguales
    if (/^(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) score -= 1; // Secuencias
    
    // Clasificación
    if (score <= 2) return 'Muy débil';
    if (score <= 4) return 'Débil';
    if (score <= 6) return 'Media';
    if (score <= 8) return 'Fuerte';
    return 'Muy fuerte';
  };

  // Generación inteligente de usernames
  const generateUsernameSuggestions = (firstName, lastName) => {
    if (!firstName || !lastName) return [];
    
    const cleanFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const suggestions = [
      `${cleanFirst}${cleanLast}`,
      `${cleanFirst}.${cleanLast}`,
      `${cleanFirst}_${cleanLast}`,
      `${cleanFirst}${cleanLast.substring(0, 1)}`,
      `${cleanFirst.substring(0, 1)}${cleanLast}`,
      `${cleanFirst}${Math.floor(Math.random() * 999) + 1}`,
      `${cleanLast}${cleanFirst.substring(0, 2)}`,
    ];
    
    return suggestions
      .filter(suggestion => suggestion.length >= 3 && suggestion.length <= 20)
      .slice(0, 5);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    // Sanitización específica por campo
    switch (name) {
      case 'firstName':
      case 'lastName':
        sanitizedValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        break;
      case 'username':
        sanitizedValue = value.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
        break;
      case 'email':
        sanitizedValue = value.toLowerCase().trim();
        break;
      case 'phone':
        sanitizedValue = value.replace(/[^+\d\s\-\(\)]/g, '');
        break;
    }
    
    let updatedForm = { ...form, [name]: sanitizedValue };

    // Generar sugerencias de username
    if (name === 'firstName' || name === 'lastName') {
      const firstName = name === 'firstName' ? sanitizedValue : form.firstName;
      const lastName = name === 'lastName' ? sanitizedValue : form.lastName;
      setUsernameSuggestions(generateUsernameSuggestions(firstName, lastName));
    }

    // Evaluar fortaleza de contraseña
    if (name === 'password') {
      setPasswordStrength(evaluatePasswordStrength(sanitizedValue));
    }

    setForm(updatedForm);
    
    // Limpiar error específico
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleUsernameSuggestionClick = (username) => {
    setForm((prev) => ({ ...prev, username }));
    setUsernameSuggestions([]);
    if (formErrors.username) {
      setFormErrors((prev) => ({ ...prev, username: null }));
    }
  };

  // Simulación de progreso de carga
  const simulateProgress = () => {
    const steps = [
      { progress: 20, delay: 300 },
      { progress: 40, delay: 500 },
      { progress: 60, delay: 400 },
      { progress: 80, delay: 600 },
      { progress: 100, delay: 300 },
    ];

    steps.forEach(({ progress, delay }, index) => {
      setTimeout(() => {
        setLoadingProgress(progress);
      }, steps.slice(0, index).reduce((acc, step) => acc + step.delay, 0));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Por favor corrige los errores del formulario.');
      
      // Scroll al primer error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }

    setLoading(true);
    setLoadingProgress(0);
    simulateProgress();

    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.replace(/[\s\-\(\)]/g, ''), // Limpiar formato
        password: form.password,
        ...(form.secretKey.trim() && {
          secretKey: form.secretKey.trim(),
          role: form.role
        })
      };

      const response = await registerUser(payload);
      
      setLoadingProgress(100);
      toast.success(response.message || 'Usuario creado exitosamente.');
      
      // Limpiar formulario
      setForm({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        secretKey: '',
        role: 'user',
      });
      
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Cuenta creada exitosamente. Puedes iniciar sesión ahora.',
            email: form.email
          }
        });
      }, 1500);
      
    } catch (err) {
      console.error('Registration error:', err);
      
      let errorMessage;
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join(', ');
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 409) {
        errorMessage = 'El email o nombre de usuario ya están en uso.';
      } else if (err.response?.status === 422) {
        errorMessage = 'Datos inválidos. Verifica la información ingresada.';
      } else {
        errorMessage = err.message || 'Error al crear la cuenta. Intenta de nuevo.';
      }
      
      toast.error(errorMessage);
      setLoadingProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength) => {
    switch (strength) {
      case 'Muy fuerte': return 'text-green-700';
      case 'Fuerte': return 'text-green-600';
      case 'Media': return 'text-yellow-600';
      case 'Débil': return 'text-orange-600';
      case 'Muy débil': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getPasswordStrengthBg = (strength) => {
    switch (strength) {
      case 'Muy fuerte': return 'bg-green-500';
      case 'Fuerte': return 'bg-green-400';
      case 'Media': return 'bg-yellow-400';
      case 'Débil': return 'bg-orange-400';
      case 'Muy débil': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  // Mostrar loading mientras se verifica autenticación
  if (authChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-all duration-300">
          <div className="text-center mb-8">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Crear Cuenta
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Completa los siguientes campos para registrarte
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  maxLength="30"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu nombre"
                />
                {formErrors.firstName && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.firstName}</p>
                )}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  maxLength="30"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ingresa tu apellido"
                />
                {formErrors.lastName && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <User className="inline w-4 h-4 mr-1" />
                Nombre de usuario *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                maxLength="20"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                  formErrors.username ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="usuario123"
              />
              {formErrors.username && (
                <p className="text-red-600 text-xs mt-1">{formErrors.username}</p>
              )}
              {usernameSuggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sugerencias:</p>
                  <div className="flex flex-wrap gap-2">
                    {usernameSuggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className="text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        onClick={() => handleUsernameSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  <Mail className="inline w-4 h-4 mr-1" />
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="tu@email.com"
                />
                {formErrors.email && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+57 300 123 4567"
                />
                {formErrors.phone && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Lock className="inline w-4 h-4 mr-1" />
                Contraseña *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Crea una contraseña segura"
                />
                <button
                  type="button"
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthBg(passwordStrength)}`}
                        style={{ 
                          width: passwordStrength === 'Muy débil' ? '20%' : 
                                passwordStrength === 'Débil' ? '40%' :
                                passwordStrength === 'Media' ? '60%' :
                                passwordStrength === 'Fuerte' ? '80%' : '100%'
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${getPasswordStrengthColor(passwordStrength)}`}>
                      {passwordStrength}
                    </span>
                  </div>
                </div>
              )}
              
              {formErrors.password && (
                <p className="text-red-600 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>

            {/* Clave secreta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                <Key className="inline w-4 h-4 mr-1" />
                Clave secreta (opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="secretKey"
                  value={form.secretKey}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  placeholder="Ingresa una clave secreta si tienes una"
                />
                {secretKeyLoading && (
                  <div className="absolute top-3 right-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
              {secretKeyValid === true && (
                <p className="text-green-600 text-xs mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Clave secreta válida
                </p>
              )}
              {secretKeyValid === false && (
                <p className="text-red-600 text-xs mt-1 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Clave secreta inválida
                </p>
              )}
            </div>

            {/* Selector de rol */}
            {secretKeyValid && availableRoles.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  <Shield className="inline w-4 h-4 mr-1" />
                  Rol *
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    formErrors.role ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {availableRoles.map((roleOption, index) => (
                    <option key={index} value={roleOption}>
                      {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.role && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.role}</p>
                )}
              </div>
            )}

            {/* Términos y condiciones */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Al registrarte, aceptas nuestros{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 underline"
                  onClick={() => window.open('/terms', '_blank')}
                >
                  Términos de Servicio
                </button>{' '}
                y{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 underline"
                  onClick={() => window.open('/privacy', '_blank')}
                >
                  Política de Privacidad
                </button>
                . Todos los datos son tratados de manera segura y confidencial.
              </p>
            </div>

            {/* Botón de submit */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </span>
                ) : (
                  'Registrarse'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>¿Ya tienes una cuenta?</span>
              <button
                onClick={() => navigate('/login')}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
              >
                Iniciar sesión
              </button>
            </div>
          </div>

          {/* Información de seguridad */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                <span>Datos seguros</span>
              </div>
              <div className="flex items-center">
                <Lock className="w-3 h-3 mr-1" />
                <span>Encriptado SSL</span>
              </div>
              <div className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                <span>Privacidad protegida</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Slider de carga */}
      <LoadingSlider isVisible={loading} progress={loadingProgress} />
      
      {/* Toast Container */}
      <ToastContainer 
        position="top-right" 
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        className="z-50"
      />
    </div>
  );
};

export default RegisterForm;