import React, { useState } from "react";
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y, Autoplay, EffectCoverflow } from "swiper/modules";
import { useInView } from 'react-intersection-observer';

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const screenshots = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Dashboard principal con estadísticas",
    caption: "Dashboard intuitivo con métricas clave"
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Calendario interactivo",
    caption: "Calendario con vista de tareas y eventos"
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Panel de gestión de tareas",
    caption: "Gestión avanzada de tareas con prioridades"
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Análisis de rendimiento",
    caption: "Informes detallados de productividad"
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Colaboración en equipo",
    caption: "Herramientas para trabajo colaborativo"
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    alt: "Gestión de proyectos",
    caption: "Vista de proyecto con múltiples tareas"
  },
];

const ScreenshotsSection = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <motion.section 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="py-16 bg-white dark:bg-gray-900"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          >
            Descubre la experiencia ChronoDesk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            Una interfaz intuitiva diseñada para potenciar tu productividad
          </motion.p>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="relative"
        >
          <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay, EffectCoverflow]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={{
              nextEl: '.custom-next',
              prevEl: '.custom-prev',
              disabledClass: 'opacity-40 cursor-default'
            }}
            pagination={{
              clickable: true,
              el: '.custom-pagination',
              renderBullet: (index, className) => 
                `<span class="${className} bg-gray-300 dark:bg-gray-600 w-3 h-3 rounded-full mx-1"></span>`
            }}
            autoplay={{ 
              delay: 5000, 
              disableOnInteraction: false,
              pauseOnMouseEnter: true 
            }}
            effect="coverflow"
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: true,
            }}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            breakpoints={{
              640: { 
                slidesPerView: 1,
                coverflowEffect: {
                  rotate: 0,
                  stretch: 0,
                  depth: 100,
                  modifier: 2.5,
                }
              },
              768: { 
                slidesPerView: 1.2,
                coverflowEffect: {
                  rotate: 5,
                  stretch: -20,
                  depth: 150,
                  modifier: 1.5,
                }
              },
              1024: { 
                slidesPerView: 1.5,
                coverflowEffect: {
                  rotate: 10,
                  stretch: -30,
                  depth: 200,
                  modifier: 1,
                }
              }
            }}
            className="rounded-2xl overflow-hidden"
          >
            {screenshots.map(({ id, src, alt, caption }) => (
              <SwiperSlide key={id}>
                <div className="relative aspect-video bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl border border-gray-200 dark:border-gray-700">
                  <motion.img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 dark:from-gray-900/80 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-left">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white text-lg font-medium"
                    >
                      {caption}
                    </motion.div>
                  </div>
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation Arrows */}
            <div className="custom-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer opacity-70 hover:opacity-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </div>
            
            <div className="custom-next absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-gray-700 transition-all cursor-pointer opacity-70 hover:opacity-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </Swiper>

          {/* Pagination */}
          <div className="custom-pagination flex justify-center mt-8 space-x-2" />
          
          {/* Thumbnails Navigation */}
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-4 overflow-x-auto pb-2 px-4 max-w-full">
              {screenshots.map(({ id, src, alt }, index) => (
                <button
                  key={id}
                  onClick={() => setActiveIndex(index)}
                  className={`transition-all duration-300 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                    index === activeIndex 
                      ? 'border-indigo-600 dark:border-indigo-400 scale-105' 
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={src}
                    alt={alt}
                    className="w-20 h-12 object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* Descripción de la captura activa */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {screenshots[activeIndex]?.caption}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {screenshots[activeIndex]?.alt}
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ScreenshotsSection;