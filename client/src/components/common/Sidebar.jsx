import React from 'react';
import { 
  X, 
  Home, 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  FileText, 
  HelpCircle,
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  user, 
  activeItem = 'dashboard',
  onItemClick 
}) => {
  
  // Elementos del menú principal
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Dashboard', 
      path: '/dashboard' 
    },
    { 
      id: 'users', 
      icon: Users, 
      label: 'Usuarios', 
      path: '/users',
      adminOnly: true 
    },
    { 
      id: 'plans', 
      icon: Shield, 
      label: 'Planes', 
      path: '/plans',
      adminOnly: true 
    },
    { 
      id: 'reports', 
      icon: BarChart3, 
      label: 'Reportes', 
      path: '/reports' 
    },
    { 
      id: 'documents', 
      icon: FileText, 
      label: 'Documentos', 
      path: '/documents' 
    },
  ];

  // Elementos del menú secundario (parte inferior)
  const secondaryItems = [
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Configuración', 
      path: '/settings' 
    },
    { 
      id: 'help', 
      icon: HelpCircle, 
      label: 'Ayuda', 
      path: '/help' 
    },
  ];

  // Filtrar elementos según el rol del usuario
  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || (user?.role === 'admin' || user?.role === 'supervisor')
  );

  const handleItemClick = (item) => {
    if (onItemClick) {
      onItemClick(item);
    }
    // En móviles, cerrar el sidebar después de hacer clic
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const SidebarItem = ({ item, isActive = false }) => (
    <button
      onClick={() => handleItemClick(item)}
      className={`
        w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200
        ${isActive 
          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-2 border-blue-500' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <item.icon size={20} className={isActive ? 'text-blue-600 dark:text-blue-400' : ''} />
        <span className="font-medium">{item.label}</span>
      </div>
      {isActive && (
        <ChevronRight size={16} className="text-blue-600 dark:text-blue-400" />
      )}
    </button>
  );

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 z-50 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Sistema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        {/* Navegación principal */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
              />
            ))}
          </div>
          
          {/* Separador */}
          <div className="my-6 border-t dark:border-gray-700" />
          
          {/* Menú secundario */}
          <div className="space-y-1">
            {secondaryItems.map((item) => (
              <SidebarItem
                key={item.id}
                item={item}
                isActive={activeItem === item.id}
              />
            ))}
          </div>
        </nav>

        {/* Footer con información del usuario */}
        {user && (
          <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{user.username}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full capitalize">
                    {user.role}
                  </span>
                  {user.plan && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {user.plan.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Estadísticas rápidas */}
            {user.loginCount && (
              <div className="mt-3 pt-3 border-t dark:border-gray-600">
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Sesiones: {user.loginCount}</span>
                  {user.plan?.endDate && (
                    <span>
                      Vence: {new Date(user.plan.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;