import React from "react";
import { Clock, Users, CalendarCheck, ShieldCheck } from "lucide-react";
import Navbar from "../../components/layout/Navbar"; 
import Footer from "../../components/layout/Footer";
import ContactSection from "./ContactSection";

const features = [
  {
    icon: <Clock className="h-8 w-8 text-brand-main" />,
    title: "Gestión del tiempo",
    description: "Organiza tus tareas y eventos con claridad y evita olvidos.",
  },
  {
    icon: <Users className="h-8 w-8 text-brand-main" />,
    title: "Colaboración eficiente",
    description: "Invita a tu equipo y trabaja en conjunto desde cualquier lugar.",
  },
  {
    icon: <CalendarCheck className="h-8 w-8 text-brand-main" />,
    title: "Calendario visual",
    description: "Visualiza y planifica con una vista clara de tus compromisos.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-brand-main" />,
    title: "Seguridad y control",
    description: "Tus datos están protegidos y tú decides quién ve qué.",
  },
];

const AboutSection = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
      <Navbar />

      <main className="flex-grow px-6 py-16 max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-brand-main">
          ¿Qué es ChronoDesk?
        </h1>

        <p className="text-center max-w-3xl mx-auto text-lg text-gray-700 dark:text-gray-300 mb-16">
          ChronoDesk es tu solución digital para gestionar tareas, eventos y colaboraciones con un enfoque moderno, claro y productivo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <ContactSection />
      <Footer />
    </div>
  );
};

export default AboutSection;
