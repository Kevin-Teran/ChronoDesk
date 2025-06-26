import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Star } from "lucide-react";

const basePlans = [
  {
    id: "free",
    title: "Gratis",
    price: "$0 COP",
    description: "Acceso básico para empezar",
    color: "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
    borderColor: "border-gray-200 dark:border-gray-700",
    button: "bg-gray-600 hover:bg-gray-700",
    features: [
      { text: "1 supervisor personal", available: true },
      { text: "Hasta 5 usuarios", available: true },
      { text: "Monitorización básica", available: true },
      { text: "Notificaciones estándar", available: true },
      { text: "Soporte por correo", available: true },
      { text: "Acceso por 1 mes", available: true }
    ],
    cta: "Registrarse gratis",
    popular: false,
    route: "/register"
  },
  {
    id: "basic",
    title: "Básico",
    price: "$49,900 COP/mes",
    description: "Ideal para equipos pequeños",
    color: "from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800",
    borderColor: "border-blue-200 dark:border-blue-700",
    button: "bg-blue-600 hover:bg-blue-700",
    features: [
      { text: "Hasta 10 supervisores", available: true },
      { text: "Hasta 50 usuarios", available: true },
      { text: "Monitorización avanzada", available: true },
      { text: "Notificaciones prioritarias", available: true },
      { text: "Soporte básico 24/5", available: true },
      { text: "Dashboard completo", available: true },
      { text: "Reportes básicos", available: true }
    ],
    cta: "Contratar plan",
    popular: true,
    paymentData: {
      planId: "basic",
      planName: "Básico",
      price: 49900,
      currency: "COP",
      billing: "monthly",
      features: ["10 supervisores", "50 usuarios", "Monitorización avanzada", "Soporte 24/5"]
    }
  },
  {
    id: "advanced",
    title: "Profesional",
    price: "$99,900 COP/mes",
    description: "Para empresas en crecimiento",
    color: "from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800",
    borderColor: "border-purple-200 dark:border-purple-700",
    button: "bg-purple-600 hover:bg-purple-700",
    features: [
      { text: "Hasta 20 supervisores", available: true },
      { text: "Hasta 200 usuarios", available: true },
      { text: "Monitorización en tiempo real", available: true },
      { text: "Notificaciones inmediatas", available: true },
      { text: "Soporte prioritario 24/7", available: true },
      { text: "Dashboard avanzado", available: true },
      { text: "Reportes personalizados", available: true },
      { text: "Exportación de datos", available: true }
    ],
    cta: "Contratar plan",
    popular: false,
    paymentData: {
      planId: "advanced",
      planName: "Profesional",
      price: 99900,
      currency: "COP",
      billing: "monthly",
      features: ["20 supervisores", "200 usuarios", "Monitorización tiempo real", "Soporte 24/7"]
    }
  }
];

const PlansSection = () => {
  const [showCustomPlan, setShowCustomPlan] = useState(false);
  const [customPlan, setCustomPlan] = useState({
    supervisors: 1,
    users: 10,
    months: 6,
    prioritySupport: false,
    advancedMonitoring: false
  });
  
  // Calcular precio del plan personalizado
  const calculateCustomPrice = () => {
    const basePrice = 20000;
    const supervisorCost = 8000 * customPlan.supervisors;
    const userCost = 1500 * customPlan.users;
    const monthDiscount = customPlan.months >= 6 ? 0.85 : (customPlan.months >= 12 ? 0.75 : 1);
    
    let featuresCost = 0;
    if (customPlan.prioritySupport) featuresCost += 15000;
    if (customPlan.advancedMonitoring) featuresCost += 20000;
    
    const subtotal = (basePrice + supervisorCost + userCost + featuresCost) * customPlan.months;
    return Math.round(subtotal * monthDiscount);
  };

  // Función para navegar con datos usando React Router
  const navigateToPayment = (planData) => {
    // Método 1: Usar sessionStorage para pasar datos (más seguro que localStorage)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedPlan', JSON.stringify({
        ...planData,
        timestamp: Date.now(),
        sessionId: Math.random().toString(36).substr(2, 9)
      }));
      
      // Navegar usando window.location o tu método preferido de React Router
      window.location.href = '/payment';
    }
  };

  // Función alternativa usando Context API (recomendado para aplicaciones más grandes)
  const navigateWithContext = (planData) => {
    // Si tienes un Context para el estado global:
    // const { setPlanData } = useContext(AppContext);
    // setPlanData(planData);
    // navigate('/payment');
    
    // Por ahora, usar sessionStorage como fallback
    navigateToPayment(planData);
  };

  // Función para manejar plan personalizado
  const submitCustomPlan = () => {
    const customPlanData = {
      planId: "custom",
      planName: "Personalizado",
      price: calculateCustomPrice(),
      currency: "COP",
      billing: "custom",
      customConfiguration: {
        supervisors: customPlan.supervisors,
        users: customPlan.users,
        months: customPlan.months,
        prioritySupport: customPlan.prioritySupport,
        advancedMonitoring: customPlan.advancedMonitoring
      },
      features: [
        `${customPlan.supervisors} supervisor(es)`,
        `${customPlan.users} usuario(s)`,
        `Duración: ${customPlan.months} mes(es)`,
        ...(customPlan.prioritySupport ? ["Soporte prioritario 24/7"] : []),
        ...(customPlan.advancedMonitoring ? ["Monitorización avanzada"] : [])
      ]
    };

    navigateToPayment(customPlanData);
  };

  // Componente de Plan
  const PlanCard = ({ plan, custom = false }) => {
    const handlePlanSelection = () => {
      if (custom) {
        setShowCustomPlan(true);
      } else if (plan.route === "/register") {
        // Para el plan gratuito, redirigir normalmente
        window.location.href = plan.route;
      } else {
        // Para planes de pago, navegar con datos
        navigateToPayment(plan.paymentData);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: custom ? 0.3 : 0.1 }}
        whileHover={{ y: -10, scale: 1.02 }}
        className={`flex flex-col h-full rounded-2xl overflow-hidden border ${plan.borderColor} shadow-lg hover:shadow-xl transition-all relative ${
          plan.popular ? "ring-2 ring-yellow-400 dark:ring-yellow-500" : ""
        }`}
      >
        {plan.popular && (
          <div className="absolute top-0 right-0 bg-yellow-400 dark:bg-yellow-500 text-gray-900 font-bold px-4 py-1 rounded-bl-lg rounded-tr-lg transform rotate-3">
            <div className="flex items-center">
              <Star size={14} className="mr-1" />
              <span>RECOMENDADO</span>
            </div>
          </div>
        )}
        
        <div className={`p-6 bg-gradient-to-b ${plan.color} flex flex-col items-center`}>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center">{plan.title}</h3>
          <div className="my-4 flex flex-col items-center">
            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{plan.price}</span>
            {custom && <span className="text-sm text-gray-600 dark:text-gray-400 mt-1">(precio calculado)</span>}
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-center">{plan.description}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 flex-grow">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle 
                  size={18} 
                  className={`mt-0.5 mr-2 flex-shrink-0 ${
                    feature.available ? "text-green-500" : "text-gray-300 dark:text-gray-600"
                  }`} 
                />
                <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="px-6 pb-6 bg-white dark:bg-gray-800">
          <button
            onClick={handlePlanSelection}
            className={`block w-full text-center ${plan.button} text-white font-bold py-3 px-6 rounded-lg transition hover:shadow-md cursor-pointer`}
          >
            {plan.cta}
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white dark:bg-gray-900">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
        >
          Planes de Suscripción
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
        >
          Encuentra el plan perfecto para tu equipo. Todos los planes incluyen funciones de monitorización y notificaciones avanzadas.
        </motion.p>
      </div>

      {!showCustomPlan ? (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {basePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
            
            {/* Plan Personalizado */}
            <PlanCard 
              plan={{
                id: "custom",
                title: "Personalizado",
                price: "Cotizar",
                description: "Diseña un plan a la medida",
                color: "from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800",
                borderColor: "border-indigo-200 dark:border-indigo-700",
                button: "bg-indigo-600 hover:bg-indigo-700",
                features: [
                  { text: "Personaliza supervisores y usuarios", available: true },
                  { text: "Selecciona duración de suscripción", available: true },
                  { text: "Agrega funciones premium", available: true },
                  { text: "Precio calculado automáticamente", available: true },
                  { text: "Sin límites predefinidos", available: true }
                ],
                cta: "Personalizar plan",
                popular: false,
                route: "#"
              }}
              custom={true}
            />
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-12 text-center text-gray-600 dark:text-gray-400 text-sm"
          >
            <p>¿Necesitas algo diferente? Contáctanos para soluciones empresariales.</p>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-indigo-200 dark:border-indigo-700"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Personaliza tu plan</h3>
            <button
              onClick={() => setShowCustomPlan(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Número de supervisores
              </label>
              <div className="flex items-center">
                <button 
                  onClick={() => setCustomPlan({...customPlan, supervisors: Math.max(1, customPlan.supervisors - 1)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-l-lg px-4 py-2 w-12"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customPlan.supervisors}
                  onChange={(e) => setCustomPlan({...customPlan, supervisors: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-y border-gray-200 dark:border-gray-600 py-2 px-4 text-center"
                />
                <button 
                  onClick={() => setCustomPlan({...customPlan, supervisors: Math.min(50, customPlan.supervisors + 1)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg px-4 py-2 w-12"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Número de usuarios
              </label>
              <div className="flex items-center">
                <button 
                  onClick={() => setCustomPlan({...customPlan, users: Math.max(5, customPlan.users - 5)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-l-lg px-4 py-2 w-12"
                >
                  -
                </button>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={customPlan.users}
                  onChange={(e) => setCustomPlan({...customPlan, users: parseInt(e.target.value) || 5})}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-y border-gray-200 dark:border-gray-600 py-2 px-4 text-center"
                />
                <button 
                  onClick={() => setCustomPlan({...customPlan, users: Math.min(500, customPlan.users + 5)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg px-4 py-2 w-12"
                >
                  +
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Duración (meses)
              </label>
              <div className="flex items-center">
                <button 
                  onClick={() => setCustomPlan({...customPlan, months: Math.max(1, customPlan.months - 1)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-l-lg px-4 py-2 w-12"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={customPlan.months}
                  onChange={(e) => setCustomPlan({...customPlan, months: parseInt(e.target.value) || 1})}
                  className="w-full bg-gray-50 dark:bg-gray-700 border-y border-gray-200 dark:border-gray-600 py-2 px-4 text-center"
                />
                <button 
                  onClick={() => setCustomPlan({...customPlan, months: Math.min(36, customPlan.months + 1)})}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-r-lg px-4 py-2 w-12"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Funciones adicionales
              </label>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="prioritySupport"
                  checked={customPlan.prioritySupport}
                  onChange={(e) => setCustomPlan({...customPlan, prioritySupport: e.target.checked})}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="prioritySupport" className="ml-3 text-gray-700 dark:text-gray-300">
                  Soporte prioritario 24/7 (+$15,000/mes)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="advancedMonitoring"
                  checked={customPlan.advancedMonitoring}
                  onChange={(e) => setCustomPlan({...customPlan, advancedMonitoring: e.target.checked})}
                  className="h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <label htmlFor="advancedMonitoring" className="ml-3 text-gray-700 dark:text-gray-300">
                  Monitorización avanzada (+$20,000/mes)
                </label>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Resumen de tu plan</h4>
              <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
                ${calculateCustomPrice().toLocaleString()} COP
              </div>
            </div>
            
            <div className="mt-4 text-gray-600 dark:text-gray-300">
              <p>• {customPlan.supervisors} supervisor(es)</p>
              <p>• {customPlan.users} usuario(s)</p>
              <p>• Duración: {customPlan.months} mes(es)</p>
              {customPlan.prioritySupport && <p>• Soporte prioritario 24/7</p>}
              {customPlan.advancedMonitoring && <p>• Monitorización avanzada</p>}
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={submitCustomPlan}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition text-lg shadow-lg hover:shadow-xl"
            >
              Proceder al pago
            </button>
            
            <button
              onClick={() => setShowCustomPlan(false)}
              className="ml-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mt-4 inline-block"
            >
              ← Volver a los planes
            </button>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default PlansSection;