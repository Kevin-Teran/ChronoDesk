import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import LoginForm from './pages/auth/LoginForm';
import RegisterForm from './pages/auth/RegisterForm';
import AboutSection from "./pages/public/AboutSection";
import Testimonials from "./pages/public/ReviewSection";
import PaymentPage from "./pages/PaymentPage";
import Dashboard from './pages/Dashboard/Dashboard';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Landing from './pages/public/Landing';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import PrivateRoute from './components/routes/PrivateRoute';

// Carga tu clave pública desde .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/testimonios" element={<Testimonials />} />
            
            {/* Envolver PaymentPage con Elements */}
            <Route 
              path="/payment" 
              element={
                <Elements stripe={stripePromise}>
                  <PaymentPage />
                </Elements>
              } 
            />

            {/* Rutas privadas */}
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              } 
            />

            {/* Redirección por defecto */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            
            {/* Página 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
