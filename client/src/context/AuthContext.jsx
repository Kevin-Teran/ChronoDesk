// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { apiHelper } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          try {
            const decoded = jwtDecode(storedToken);
            const currentTime = Date.now() / 1000;
            
            console.log('Token decodificado:', {
              userId: decoded.id,
              exp: decoded.exp,
              isExpired: decoded.exp < currentTime
            });

            if (decoded.exp < currentTime) {
              console.log('Token expirado, limpiando almacenamiento');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setLoading(false);
              return;
            }

            setToken(storedToken);

            if (storedUser) {
              try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                console.log('Usuario cargado desde localStorage:', parsedUser);
              } catch (parseError) {
                console.error('Error parsing stored user:', parseError);
                localStorage.removeItem('user');
              }
            }

            try {
              const userResponse = await apiHelper.get(`/users/${decoded.id}`, {
                headers: {
                  Authorization: `Bearer ${storedToken}`,
                },
              });

              const freshUser = userResponse.data;
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
              
              console.log('Usuario actualizado desde servidor:', freshUser);
            } catch (serverError) {
              console.error('Error verificando token con servidor:', serverError);
              
              if (serverError.response?.status === 401 || serverError.response?.status === 403) {
                console.log('Token rechazado por servidor, limpiando almacenamiento');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setToken(null);
                setUser(null);
              }
            }

          } catch (tokenError) {
            console.error('Token inválido:', tokenError);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error en inicialización de auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // SINCRONIZACIÓN ENTRE PESTAÑAS
    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'user') {
        window.location.reload(); // Forzar sincronización de sesión
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  /**
   * Iniciar sesión de usuario
   * @param {Object} credentials - Credenciales de acceso
   * @param {string} credentials.identifier - Nombre de usuario o email
   * @param {string} credentials.password - Contraseña
   * @param {boolean} [credentials.rememberMe] - Recordar sesión
   * @returns {Promise<Object>} Promesa que resuelve con los datos del usuario
   */
  const login = async ({ identifier, password, rememberMe }) => {
    try {
      console.log('Iniciando login...', { identifier, rememberMe });
      
      const response = await apiHelper.post('/auth/login', {
        identifier,
        password,
        rememberMe
      });

      const receivedToken = response.data.token;
      const returnedUser = response.data.user;
      
      console.log('Login exitoso:', { token: !!receivedToken, user: returnedUser });

      try {
        const decoded = jwtDecode(receivedToken);
        console.log('Token decodificado:', decoded);
      } catch (decodeError) {
        console.error('Token recibido inválido:', decodeError);
        throw new Error('Token inválido recibido del servidor');
      }

      let fullUser;
      try {
        const userResponse = await apiHelper.get(`/users/${returnedUser.id}`, {
          headers: {
            Authorization: `Bearer ${receivedToken}`,
          },
        });
        fullUser = userResponse.data;
      } catch (userError) {
        console.error('Error obteniendo datos completos del usuario:', userError);
        fullUser = returnedUser;
      }

      setUser(fullUser);
      setToken(receivedToken);

      localStorage.setItem('user', JSON.stringify(fullUser));
      localStorage.setItem('token', receivedToken);

      console.log('Usuario y token guardados correctamente');
      return fullUser;

    } catch (err) {
      console.error('Error en login:', err);
      throw err;
    }
  };

  /**
   * Cerrar sesión del usuario
   * @returns {Promise<void>} Promesa que se resuelve cuando se completa el logout
   */
  const logout = async () => {
    try {
      console.log('Iniciando logout...');
      
      if (token) {
        try {
          await apiHelper.post('/auth/logout', {}, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } catch (logoutError) {
          console.error('Error en logout del servidor (continuando):', logoutError);
        }
      }
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('Logout completado');
    }
  };

  const isAuthenticated = !!user && !!token;

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };