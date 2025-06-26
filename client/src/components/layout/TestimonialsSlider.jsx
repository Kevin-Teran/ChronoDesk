import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';
import ReviewModal from './ReviewModal';

const TestimonialsSlider = ({ testimonials = [] }) => {
  const { user } = useContext(AuthContext);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNavigation = (direction) => {
    setCurrentIndex(prev => {
      const newIndex = direction === 'next' 
        ? (prev + 1) % testimonials.length 
        : (prev - 1 + testimonials.length) % testimonials.length;
      return newIndex;
    });
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setLoading(true);
      // Lógica para enviar a tu API
      console.log('Enviando reseña:', reviewData);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
            Testimonios Destacados
          </h2>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-gray-200 sm:text-4xl">
            Lo que dicen nuestros usuarios
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
              {user ? (
                '¡Sé el primero en dejar una reseña!'
              ) : (
                'Regístrate para dejar la primera reseña'
              )}
            </p>
            <div className="flex gap-4 justify-center">
              {user ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Escribir reseña'}
                </button>
              ) : (
                <>
                  <Link to="/register" className="btn-primary">
                    Registrarse
                  </Link>
                  <Link to="/login" className="btn-secondary">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </div>
        ) : (
          <>
            <div className="relative max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <img
                    className="h-14 w-14 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                    src={testimonials[currentIndex].user.avatar}
                    alt={testimonials[currentIndex].user.name}
                  />
                  <div className="ml-4">
                    <p className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {testimonials[currentIndex].user.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonials[currentIndex].user.role}
                    </p>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 dark:text-gray-300 italic text-lg">
                  "{testimonials[currentIndex].content}"
                </blockquote>

                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={() => handleNavigation('prev')}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                  
                  <div className="flex gap-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-2 w-2 rounded-full transition-all ${
                          idx === currentIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => handleNavigation('next')}
                    className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link to="/testimonials" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                Ver todas las reseñas →
              </Link>
            </div>
          </>
        )}

        <ReviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmitReview}
          user={user}
        />
      </div>
    </section>
  );
};

export default TestimonialsSlider;