import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import LanguageSwitcher from './components/LanguageSwitcher';
import OfflineIndicator from './components/OfflineIndicator';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import Marketplace from './pages/Marketplace';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import './App.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/checkout/:cropId" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route 
                path="/farmer-dashboard" 
                element={
                  <ProtectedRoute role="farmer">
                    <FarmerDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consumer-dashboard" 
                element={
                  <ProtectedRoute role="consumer">
                    <ConsumerDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <LanguageSwitcher className="fixed top-20 right-4 z-40" />
          <OfflineIndicator />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  if (!user || (role && user.role !== role)) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default App;
