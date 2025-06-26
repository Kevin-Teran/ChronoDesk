import React, { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const AvatarDropdown = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth(); 

  const initials = user
  ? (user.firstName?.[0] || user.username?.[0] || '') +
    (user.lastName?.[0] || user.username?.[1] || '')
  : 'NN';


  const handleLogout = () => {
    setShowDropdown(false);
    logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Menú de usuario"
      >
        {initials}
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-20">
            <div className="p-4 border-b dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">@{user?.username}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-1">{user?.email}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 capitalize mt-1">{user?.role}</p>
              {user?.plan && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Plan: {user.plan.name}
                </p>
              )}
            </div>

            <div className="py-2">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} />
                <span>Mi Perfil</span>
              </button>

              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3 transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Settings size={16} />
                <span>Configuración</span>
              </button>

              <hr className="my-2 border-gray-200 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvatarDropdown;
