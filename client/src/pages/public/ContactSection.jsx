import React, { useState } from "react";
import { Mail, User, MessageCircle, Loader2 } from "lucide-react";

const ContactSection = () => {
  const [messageSent, setMessageSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulación de envío asíncrono
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setMessageSent(true);
    setIsSubmitting(false);
  };

  const InputField = ({ icon: Icon, label, type = "text", placeholder, required, multiline = false }) => (
    <div className="space-y-2">
      <label htmlFor={label} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
          <Icon className="w-5 h-5" />
        </div>
        {multiline ? (
          <textarea
            id={label}
            name={label}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y min-h-[120px] transition-all"
          />
        ) : (
          <input
            type={type}
            id={label}
            name={label}
            placeholder={placeholder}
            required={required}
            className="w-full px-4 py-2 pl-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        )}
      </div>
    </div>
  );

  return (
    <section className="py-16 px-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-xl mx-auto rounded-xl shadow-lg bg-gray-50 dark:bg-gray-800 p-8 transition-all hover:shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-indigo-600 dark:text-indigo-400">
          Contáctanos
        </h2>

        {messageSent ? (
          <div className="text-center animate-fade-in">
            <p className="text-green-600 dark:text-green-400 font-medium text-lg mb-4">
              ✅ ¡Gracias por tu mensaje!
            </p>
            <button
              onClick={() => setMessageSent(false)}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Enviar otro mensaje
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              icon={User}
              label="Nombre"
              placeholder="Tu nombre completo"
              required
            />

            <InputField
              icon={Mail}
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              required
            />

            <InputField
              icon={MessageCircle}
              label="Mensaje"
              placeholder="Escribe tu mensaje aquí"
              required
              multiline
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar mensaje"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default ContactSection;