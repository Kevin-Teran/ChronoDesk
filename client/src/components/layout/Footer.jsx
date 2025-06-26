import { Link } from 'react-router-dom';
import { Clock, Github, Mail, Linkedin } from 'lucide-react';
import logo from "../../assets/chronodesk.jpg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-light-background dark:bg-dark-background text-gray-600 dark:text-gray-400 transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={logo}
                alt="ChronoDesk"
                className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full border-2 border-indigo-500 dark:border-indigo-300"
              />
              <span className="text-xl sm:text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ChronoDesk
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Gestión de tareas intuitiva para equipos de cualquier tamaño. 
              Colabora, sigue el progreso y aumenta tu productividad.
            </p>
            <div className="mt-8 flex space-x-6">
              <a
                href="https://github.com/Kevin-Teran"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-main dark:hover:text-brand-main/90 transition"
              >
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a
                href="mailto:erenmicasa8@gmail.com"
                className="hover:text-brand-main dark:hover:text-brand-main/90 transition"
              >
                <span className="sr-only">Correo</span>
                <Mail className="h-6 w-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/kevin-david-mariano-teran-7453a4367/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-main dark:hover:text-brand-main/90 transition"
              >
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          {/* Enlaces de la compañía */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">
              Compañía
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link 
                  to="/about" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link 
                  to="#planes" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Precios
                </Link>
              </li>
              
            </ul>
          </div>
          
          {/* Recursos */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase">
              Recursos
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link 
                  to="/docs" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Documentación
                </Link>
              </li>
              <li>
                <Link 
                  to="/support" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Soporte
                </Link>
              </li>
              <li>
                <Link 
                  to="/api" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  API
                </Link>
              </li>
              <li>
                <Link 
                  to="/status" 
                  className="text-sm hover:text-brand-main dark:hover:text-brand-main/90 transition"
                >
                  Estado del servicio
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm">
            &copy; {currentYear} ChronoDesk. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;