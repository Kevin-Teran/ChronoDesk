import React from 'react';
import PropTypes from 'prop-types';

const StarRating = ({ rating, onRate, editable = true, size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Enter' && editable) {
      onRate(index + 1);
    }
  };

  return (
    <div 
      className="flex items-center"
      role={editable ? 'slider' : 'img'}
      aria-label={editable ? 'Seleccionar calificación' : `Calificación: ${rating} de 5 estrellas`}
      aria-valuenow={rating}
      aria-valuemin={0}
      aria-valuemax={5}
      tabIndex={editable ? 0 : -1}
    >
      {[...Array(5)].map((_, index) => {
        const currentRating = index + 1;
        const isFilled = rating >= currentRating;
        const isHalfFilled = rating >= currentRating - 0.5 && rating < currentRating;

        return (
          <button
            key={index}
            type="button"
            className={`${sizes[size]} transition-transform duration-200 ${
              editable ? 'cursor-pointer hover:scale-125' : 'cursor-default'
            }`}
            onClick={() => editable && onRate(currentRating)}
            onKeyDown={(e) => editable && handleKeyDown(e, index)}
            disabled={!editable}
            aria-hidden={!editable}
            tabIndex={editable ? 0 : -1}
          >
            <svg
              className={`${sizes[size]} ${
                isFilled
                  ? 'text-yellow-400'
                  : isHalfFilled
                  ? 'text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {isHalfFilled && !isFilled ? (
                <path d="M10 1.618l1.769 3.584 3.953.576-2.86 2.789.675 3.934-3.537-1.86-3.537 1.86.675-3.934-2.86-2.789 3.953-.576L10 1.618zM10 0L7.347 3.948 2.5 4.583l3.214 3.134-.758 4.43L10 10.277l4.044 2.13-.758-4.43L17.5 4.583l-4.847-.635L10 0z" />
              ) : (
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              )}
            </svg>
          </button>
        );
      })}
    </div>
  );
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  onRate: PropTypes.func,
  editable: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

StarRating.defaultProps = {
  editable: true,
  size: 'md'
};

export default StarRating;