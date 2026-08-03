import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIAssistant from "./pages/AIAssistant";
import FarmerDashboard from "./pages/FarmerDashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import Marketplace from "./pages/Marketplace";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import "./App.css";

function App() {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={ <Login /> }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/checkout/:cropId" element={<Checkout />} />
        <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
        <Route
          path="/farmer-dashboard"
          element={
            authUser?.role === "farmer" ? (
              <FarmerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/consumer-dashboard"
          element={
            authUser?.role === "consumer" ? (
              <ConsumerDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;
