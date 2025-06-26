import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import ReviewModal from '../../components/layout/ReviewModal';
import StarRating from '../../components/layout/StarRating';

const ReviewSection = ({ review = [] }) => {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    rating: null,
    sort: 'recent',
    search: ''
  });
  const [visibleTestimonials, setVisibleTestimonials] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const filtered = review
      .filter(t => 
        (!filters.rating || t.rating >= filters.rating) &&
        t.content.toLowerCase().includes(filters.search.toLowerCase())
      )
      .sort((a, b) => {
        if (filters.sort === 'recent') return new Date(b.date) - new Date(a.date);
        if (filters.sort === 'oldest') return new Date(a.date) - new Date(b.date);
        return b.rating - a.rating;
      });

    setVisibleTestimonials(filtered.slice(0, currentPage * itemsPerPage));
  }, [filters, review, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Todas las reseñas
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            <select
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value || null})}
              className="input-select"
            >
              <option value="">Todas las valoraciones</option>
              {[5,4,3,2,1].map(num => (
                <option key={num} value={num}>{num} estrellas</option>
              ))}
            </select>
            
            <select
              value={filters.sort}
              onChange={(e) => setFilters({...filters, sort: e.target.value})}
              className="input-select"
            >
              <option value="recent">Más recientes</option>
              <option value="oldest">Más antiguas</option>
              <option value="rating">Mejor valoradas</option>
            </select>
            
            <input
              type="text"
              placeholder="Buscar reseñas..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="input-text"
            />
          </div>
          
          {user && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Escribir reseña
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTestimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.user.avatar}
                  alt={testimonial.user.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="ml-4">
                  <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {testimonial.user.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(testimonial.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <StarRating rating={testimonial.rating} />
              
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        {visibleTestimonials.length < review.length && (
          <div className="mt-8 text-center">
            <button
              onClick={handleLoadMore}
              className="btn-secondary"
            >
              Cargar más reseñas
            </button>
          </div>
        )}

        <ReviewModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={(newReview) => {
            // Lógica para enviar a tu API
            console.log('Nueva reseña:', newReview);
          }}
          user={user}
        />
      </div>
    </div>
  );
};

export default ReviewSection;