import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ScreenshotsSection from "./ScreenshotsSection";
import PlansSection from "./PlansSection";
import CTASection from "./CTASection";
import FeaturesSection from "./FeaturesSection";
import ContactSection from "./ContactSection";
import TestimonialsSlider from "../../components/layout/TestimonialsSlider";
import ReviewModal from "../../components/layout/ReviewModal";
import { reviewService } from '../../services/reviewService';
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const Landing = () => {
  const [comments, setComments] = useState([]);
  const [selectedComment, setSelectedComment] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await reviewService.getAllReviews(3);
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, []);

  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const SectionWrapper = ({ children, id, className = "" }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1,
    });

    return (
      <motion.section
        ref={ref}
        id={id}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className={`scroll-mt-20 ${className}`}
      >
        {children}
      </motion.section>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 scroll-smooth">
      <Navbar />
      
      {/* Sección Hero - Corregido margen superior y eliminado borde */}
      <SectionWrapper 
        id="hero" 
        className="bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"> {/* Añadido pt-24 para espacio bajo navbar */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <motion.div 
              className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                Presentando a
              </span>
              <h1 className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl text-gray-900 dark:text-white">
                <span className="block">ChronoDesk</span>
                <span className="block text-primary-600 dark:text-primary-400">Gestión de tareas</span>
              </h1>
              <motion.p
                className="mt-3 text-lg text-gray-600 dark:text-gray-400 sm:mt-5 lg:text-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Un potente sistema de gestión de tareas basado en roles, diseñado para equipos de todos los tamaños.
              </motion.p>
              <motion.div
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/register"
                  className="btn-primary py-3 px-6 text-sm font-medium rounded-lg transition-all hover:transform hover:scale-105"
                >
                  Empezar
                </Link>
                <button
                  onClick={() => handleScrollToSection('pricing')}
                  className="btn-outline py-3 px-6 text-sm font-medium rounded-lg border-2 transition-all hover:border-primary-600 dark:hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  Ver planes
                </button>
              </motion.div>
            </motion.div>
            <motion.div
              className="mt-12 relative lg:mt-0 lg:col-span-6 lg:flex lg:items-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative w-full rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
                  alt="Team collaborating"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 dark:from-gray-900/50 dark:to-gray-900/50" />
              </div>
            </motion.div>
          </div>
        </div>
      </SectionWrapper>

      {/* Secciones posteriores */}
      <SectionWrapper id="features" className="bg-white dark:bg-gray-900">
        <FeaturesSection />
      </SectionWrapper>

      <SectionWrapper id="gallery" className="bg-gray-50 dark:bg-gray-800">
        <ScreenshotsSection />
      </SectionWrapper>

      <SectionWrapper id="pricing" className="bg-white dark:bg-gray-900">
        <PlansSection />
      </SectionWrapper>

      <SectionWrapper id="testimonials" className="bg-gray-50 dark:bg-gray-800">
        <TestimonialsSlider
          comments={comments}
          onSelectComment={setSelectedComment}
        />
      </SectionWrapper>

      {selectedComment && (
        <ReviewModal
          comment={selectedComment}
          onClose={() => setSelectedComment(null)}
        />
      )}

      <SectionWrapper id="contact" className="bg-white dark:bg-gray-900">
        <ContactSection />
      </SectionWrapper>

      <SectionWrapper id="CTA" className="bg-gray-50 dark:bg-gray-800">
        <CTASection />
      </SectionWrapper>
      
      <Footer />
    </div>
  );
};

export default Landing;