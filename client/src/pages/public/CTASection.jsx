import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="bg-indigo-600 dark:bg-indigo-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <div className="text-center lg:text-left mb-8 lg:mb-0">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            <span className="block dark:text-indigo-100">¿Listo para optimizar tu flujo?</span>
            <span className="block mt-2 text-indigo-100 dark:text-indigo-200/90">
              Comienza tu prueba gratuita hoy
            </span>
          </h2>
        </div>

        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:space-x-4 justify-center">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-6 py-3 
            border border-transparent text-base font-medium rounded-lg 
            bg-white dark:bg-indigo-100 
            text-indigo-600 dark:text-indigo-900 
            hover:bg-gray-50 dark:hover:bg-indigo-200 
            transition-all duration-300 
            shadow-md hover:shadow-lg"
          >
            Comenzar ahora
          </Link>
          
          <Link
            to="#planes"
            className="inline-flex items-center justify-center px-6 py-3 
            border border-white/30 dark:border-indigo-200/30 
            text-base font-medium rounded-lg 
            bg-indigo-700/90 dark:bg-indigo-800 
            text-white dark:text-indigo-100 
            hover:bg-indigo-700 dark:hover:bg-indigo-700/90 
            transition-all duration-300 
            shadow-md hover:shadow-lg"
          >
            Ver planes
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTASection;