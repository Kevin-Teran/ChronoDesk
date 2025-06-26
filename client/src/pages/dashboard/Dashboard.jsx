import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/common/Sidebar';
import Topbar from '../../components/common/Topbar';
import Footer from '../../components/layout/Footer';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-700 dark:text-white">
        Cargando usuario...
      </div>
    );
  }  
  return (
    
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-all duration-300">
      
      {/* Topbar Fijo */}
      <Topbar />
      {/* Contenedor Principal */}
      <div className="flex pt-16 h-screen">
        {/* Sidebar Fijo */}
        <div className="fixed left-0 top-16 h-full z-40">
          <Sidebar />
        </div>

        {/* Contenido Principal */}
        <main className="flex-grow ml-64 p-8 transition-all duration-300 min-h-[calc(100vh-8rem)]"> {/* Margen para Sidebar */}
          <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            {/* Encabezado */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                ¡Bienvenido, {user?.firstName || user?.username}!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Tu rol: <span className="font-semibold text-blue-600 dark:text-blue-400">{user?.role}</span>
              </p>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
                  Proyectos Activos
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">5</p>
              </div>
              <div className="bg-green-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
                  Tareas Completadas
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">23</p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
                  Mensajes Nuevos
                </h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</p>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    Crear nuevo proyecto
                  </span>
                </button>
                <button className="p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    Ver reportes
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Dashboard;