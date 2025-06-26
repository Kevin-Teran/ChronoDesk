import React from "react";
import { motion } from 'framer-motion';
import { CheckCircle, CalendarIcon, Users, Bell, BarChart, Clock } from 'lucide-react';

const features = [
    {
        icon: CheckCircle,
        title: "Gestión de tareas",
        description: "Crea, asigna y monitoriza tareas fácilmente. Establece prioridades, plazos y supervisa el progreso en tiempo real."
    },
    {
        icon: CalendarIcon,
        title: "Calendario interactivo",
        description: "Visualiza tareas y plazos en un calendario dinámico. Arrastra y suelta para reprogramar con actualizaciones instantáneas."
    },
    {
        icon: Users,
        title: "Acceso basado en roles",
        description: "Adapte el acceso y los permisos según los roles: administrador, supervisor y usuario, garantizando que las personas adecuadas tengan el acceso adecuado."
    },
    {
        icon: Bell,
        title: "Notificaciones",
        description: "Manténgase actualizado con notificaciones instantáneas sobre asignaciones de tareas, actualizaciones y fechas límite para no perderse nunca cambios importantes."
    },
    {
        icon: BarChart,
        title: "Análisis e informes",
        description: "Obtenga información con análisis poderosos sobre las tasas de finalización de tareas, el desempeño del equipo y las tendencias de productividad."
    },
    {
        icon: Clock,
        title: "Gestión de planes",
        description: "Elija entre varios planes de suscripción o cree planes personalizados adaptados a las necesidades específicas de su organización."
    }
];

const FeaturesSection = () => {
    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                >
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Todo lo que necesitas para gestionar tareas
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400">
                        ChronoDesk combina potentes funciones con una interfaz intuitiva
                    </p>
                </motion.div>

                <motion.div 
                    className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="flex flex-col h-full"
                        >
                            <div className="flex flex-col h-full p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                                <div className="mb-6">
                                    <span className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-md">
                                        <feature.icon className="h-7 w-7 text-white" />
                                    </span>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default FeaturesSection;