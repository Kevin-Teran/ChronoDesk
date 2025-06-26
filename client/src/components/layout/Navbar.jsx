import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Transition } from "@headlessui/react";
import logo from "../../assets/chronodesk.jpg";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../layout/ThemeToggle";
import AvatarDropdown from "../common/AvatarDropdown";

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const sections = [
    { id: "hero", name: "Inicio", path: "/" },
    { id: "features", name: "Características" },
    { id: "gallery", name: "Galería" },
    { id: "pricing", name: "Planes" },
    { id: "testimonials", name: "Testimonios" },
    { id: "contact", name: "Contacto" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const offset = 100;
      const position = window.scrollY + offset;
      let current = "";

      sections.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (section) {
          const { offsetTop, offsetHeight } = section;
          if (position >= offsetTop && position < offsetTop + offsetHeight) {
            current = id;
          }
        }
      });

      setActiveSection(current || "hero");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleNavigation = (section) => {
    if (section.path) {
      navigate(section.path);
    } else if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: section.id } });
    } else {
      document.getElementById(section.id)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.state]);

  return (
    <nav className={`fixed w-full top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
      isScrolled ? "bg-white/90 dark:bg-gray-900/90 border-b dark:border-gray-700" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 xl:px-8">
        <div className="relative flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-[140px]">
            <button 
              onClick={() => handleNavigation(sections[0])}
              className="flex items-center gap-2 group"
            >
              <img 
                src={logo} 
                alt="ChronoDesk" 
                className="h-10 w-10 md:h-12 md:w-12 rounded-lg transition-transform duration-300 group-hover:scale-105" 
              />
              <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ChronoDesk
              </span>
            </button>
          </div>

          {/* Navegación desktop */}
          <div className="hidden xl:flex items-center flex-1 justify-center">
            <div className="flex items-center gap-6">
              {sections.slice(1).map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleNavigation(section)}
                  className={`relative px-2 py-1 text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-blue-500"
                  }`}
                >
                  {section.name}
                  {activeSection === section.id && (
                    <span className="absolute inset-x-0 -bottom-2 h-0.5 bg-blue-500 animate-underline" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Controles derecho */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {/* Menú usuario desktop */}
            <div className="hidden xl:flex items-center gap-4">
              {user ? (
                <AvatarDropdown user={user} logout={logout} />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Menú hamburguesa */}
            <div className="xl:hidden flex items-center gap-2">
              {user && <AvatarDropdown user={user} logout={logout} mobile />}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Menú móvil */}
          <Transition
            show={isOpen}
            as={React.Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div className="absolute xl:hidden top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg py-4 px-6">
              <div className="grid gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => handleNavigation(section)}
                    className={`w-full px-4 py-3 text-left rounded-lg ${
                      activeSection === section.id
                        ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {section.name}
                  </button>
                ))}
                <div className="border-t dark:border-gray-700 pt-4 mt-2">
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        Iniciar sesión
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg mt-2"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;