import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { processPayment } from '../services/paymentService';
import { createPlan } from '../services/planService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CreditCard, User, Calendar, ShieldCheck, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PaymentPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [cardBrand, setCardBrand] = useState(null);

  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const countryNames = {
    'CO': 'Colombia',
    'MX': 'México',
    'AR': 'Argentina',
    'CL': 'Chile',
    'PE': 'Perú',
    'ES': 'España'
  };

  useEffect(() => {
    const loadPlanData = () => {
      try {
        const planData = JSON.parse(sessionStorage.getItem('selectedPlan'));
        
        if (!planData) {
          toast.error('No se encontró información del plan seleccionado');
          navigate('/plans');
          return;
        }

        if (!planData.planId || !planData.price) {
          toast.error('Datos del plan inválidos');
          navigate('/plans');
          return;
        }

        if (planData.timestamp && (Date.now() - planData.timestamp) > 30 * 60 * 1000) {
          toast.error('La sesión de compra ha expirado');
          navigate('/plans');
          return;
        }

        setSelectedPlan(planData);
        
        // Prellenar datos del usuario si existen
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.firstName || userData.email) {
          setFormData(prev => ({
            ...prev,
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            email: userData.email || '',
            phone: userData.phone || ''
          }));
        }
      } catch (error) {
        console.error('Error loading plan data:', error);
        toast.error('Error al cargar la información del plan');
        navigate('/plans');
      }
    };

    loadPlanData();
  }, [navigate]);

  // Validación de formulario
  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+\d\s\-()]{7,20}$/;

    if (!formData.name.trim()) errors.name = 'Nombre completo requerido';
    if (!formData.email.trim()) {
      errors.email = 'Email requerido';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Teléfono requerido';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Formato de teléfono inválido';
    }
    if (!formData.address.trim()) errors.address = 'Dirección requerida';
    if (!formData.city.trim()) errors.city = 'Ciudad requerida';
    if (!formData.postalCode.trim()) errors.postalCode = 'Código postal requerido';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    if (!cardComplete) {
      toast.error('Por favor completa los datos de la tarjeta');
      return;
    }

    if (!stripe || !elements) {
      toast.error('El sistema de pagos no está disponible');
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      const billingDetails = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          line1: formData.address,
          city: formData.city,
          country: formData.country, // Ya usamos el código de 2 letras
          postal_code: formData.postalCode
        }
      };

      const { error: validationError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails
      });

      if (validationError) {
        throw new Error(validationError.message || 'Error al validar la tarjeta');
      }

      // Simular procesamiento de pago
      const paymentResult = await processPayment({
        planId: selectedPlan.planId,
        amount: selectedPlan.price,
        currency: selectedPlan.currency || 'COP',
        paymentMethodId: paymentMethod.id,
        customerDetails: {
          ...formData,
          country: countryNames[formData.country] || formData.country // Enviar nombre del país al backend
        }
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Error al procesar el pago');
      }

      // Crear el plan en la base de datos
      const planData = {
        name: selectedPlan.planName || selectedPlan.planId,
        description: `Plan ${selectedPlan.planName} adquirido el ${new Date().toLocaleDateString()}`,
        startDate: new Date(),
        endDate: calculateEndDate(selectedPlan),
        maxSupervisors: getMaxSupervisors(selectedPlan),
        maxUsers: getMaxUsers(selectedPlan),
        status: 'active',
        createdBy: formData.email
      };

      const planCreation = await createPlan(planData);
      
      if (!planCreation.success) {
        throw new Error(planCreation.error || 'Error al crear el plan');
      }

      setPaymentSuccess(true);
      sessionStorage.removeItem('selectedPlan');
      sendConfirmationEmail(formData.email, selectedPlan);
      
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError(error.message || 'Error en el proceso de pago');
      toast.error(error.message || 'Error en el proceso de pago');
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const calculateEndDate = (plan) => {
    const endDate = new Date();
    const months = plan.customConfiguration?.months || 
                  (plan.billing === 'monthly' ? 1 : 1);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate;
  };

  const getMaxSupervisors = (plan) => {
    if (plan.customConfiguration?.supervisors) {
      return plan.customConfiguration.supervisors;
    }
    
    const limits = { basic: 10, advanced: 20, enterprise: 50 };
    return limits[plan.planId] || 1;
  };

  const getMaxUsers = (plan) => {
    if (plan.customConfiguration?.users) {
      return plan.customConfiguration.users;
    }
    
    const limits = { basic: 50, advanced: 200, enterprise: 1000 };
    return limits[plan.planId] || 5;
  };

  const sendConfirmationEmail = (email, plan) => {
    console.log(`Email enviado a ${email} con detalles del plan ${plan.planName}`);
  };

  // Configuración del elemento de tarjeta
  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
    hidePostalCode: true
  };

  if (!selectedPlan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando información del plan...</p>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-2xl w-full text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            ¡Pago Completado Exitosamente!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            Tu plan <span className="font-semibold">{selectedPlan.planName}</span> ha sido activado.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Detalles del plan:</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {selectedPlan.features?.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="font-medium text-gray-900 dark:text-white">
                Total pagado: ${selectedPlan.price.toLocaleString()} {selectedPlan.currency || 'COP'}
              </p>
            </div>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Hemos enviado un correo de confirmación a <span className="font-medium">{formData.email}</span>
          </p>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Finalizar Compra
          </h1>
          <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
            Completa los datos para activar tu plan <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedPlan.planName}</span>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Resumen del plan */}
            <div className="bg-gray-50 dark:bg-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <ShieldCheck className="mr-2 text-blue-600" />
                Resumen del Plan
              </h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Plan seleccionado:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedPlan.planName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Precio:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    ${selectedPlan.price.toLocaleString()} {selectedPlan.currency || 'COP'}
                  </span>
                </div>
                
                {selectedPlan.customConfiguration && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Configuración personalizada:</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>• {selectedPlan.customConfiguration.supervisors} supervisor(es)</li>
                      <li>• {selectedPlan.customConfiguration.users} usuario(s)</li>
                      <li>• Duración: {selectedPlan.customConfiguration.months} mes(es)</li>
                      {selectedPlan.customConfiguration.prioritySupport && <li>• Soporte prioritario</li>}
                      {selectedPlan.customConfiguration.advancedMonitoring && <li>• Monitorización avanzada</li>}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">¿Qué incluye tu plan?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {selectedPlan.features?.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Formulario de pago */}
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <CreditCard className="mr-2 text-blue-600" />
                Información de Pago
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información personal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Personal</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Juan Pérez"
                      />
                      {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                      />
                      {formErrors.email && <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+57 300 123 4567"
                      />
                      {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Dirección */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Dirección de Facturación</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Dirección *
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Calle 123 # 45 - 67"
                      />
                      {formErrors.address && <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ciudad *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.city ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Bogotá"
                      />
                      {formErrors.city && <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>}
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código Postal *
                      </label>
                      <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                          formErrors.postalCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: 110231"
                      />
                      {formErrors.postalCode && <p className="mt-1 text-sm text-red-600">{formErrors.postalCode}</p>}
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        País
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="CO">Colombia</option>
                        <option value="MX">México</option>
                        <option value="AR">Argentina</option>
                        <option value="CL">Chile</option>
                        <option value="PE">Perú</option>
                        <option value="ES">España</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Datos de tarjeta */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Datos de Tarjeta</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Información de la Tarjeta *
                        </label>
                        {cardBrand && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {cardBrand}
                          </span>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-600 p-3 rounded border border-gray-300 dark:border-gray-500">
                        <CardElement 
                          options={cardElementOptions}
                          onChange={(e) => {
                            setCardComplete(e.complete);
                            setCardBrand(e.brand);
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Usamos Stripe para procesar tus pagos de forma segura. No almacenamos los datos de tu tarjeta.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Botón de pago */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || !cardComplete}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center ${
                      loading || !cardComplete ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Pagar ${selectedPlan.price.toLocaleString()} {selectedPlan.currency || 'COP'}
                      </>
                    )}
                  </button>
                  
                  {paymentError && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 text-red-700 dark:text-red-300 flex items-start">
                      <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Error en el pago</h4>
                        <p className="text-sm mt-1">{paymentError}</p>
                      </div>
                    </div>
                  )}
                  
                  <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Al continuar, aceptas nuestros{' '}
                    <a href="/terms" className="text-blue-600 hover:underline dark:text-blue-400">Términos de Servicio</a>{' '}
                    y{' '}
                    <a href="/privacy" className="text-blue-600 hover:underline dark:text-blue-400">Política de Privacidad</a>.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default PaymentPage;