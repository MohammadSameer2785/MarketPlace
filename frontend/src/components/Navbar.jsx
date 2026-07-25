import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { Menu, X, User, LogOut, ShoppingBag, Tractor } from 'lucide-react';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌾</span>
            <span className="text-xl font-bold text-green-600">AROVASTORE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/') ? 'text-green-600 bg-green-50' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActivePath('/marketplace') ? 'text-green-600 bg-green-50' : ''
              }`}
            >
              Marketplace
            </Link>
            
            {authUser ? (
              <>
                {authUser.role === 'farmer' && (
                  <Link
                    to="/farmer-dashboard"
                    className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath('/farmer-dashboard') ? 'text-green-600 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <Tractor className="w-4 h-4" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                )}
                {authUser.role === 'consumer' && (
                  <Link
                    to="/consumer-dashboard"
                    className={`text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActivePath('/consumer-dashboard') ? 'text-green-600 bg-green-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                )}
                
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    <User className="w-4 h-4" />
                    <span>{authUser.name}</span>
                  </button>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {authUser.role === 'farmer' ? 'Farmer' : 'Consumer'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/marketplace"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActivePath('/marketplace') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              
              {authUser ? (
                <>
                  {authUser.role === 'farmer' && (
                    <Link
                      to="/farmer-dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActivePath('/farmer-dashboard') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Farmer Dashboard
                    </Link>
                  )}
                  {authUser.role === 'consumer' && (
                    <Link
                      to="/consumer-dashboard"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActivePath('/consumer-dashboard') ? 'text-green-600 bg-green-50' : 'text-gray-700 hover:text-green-600'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Consumer Dashboard
                    </Link>
                  )}
                  
                  <div className="border-t pt-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      {authUser.name} ({authUser.role})
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-green-600 text-white hover:bg-green-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
