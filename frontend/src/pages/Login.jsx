import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Shield, Clock } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const { login, loginWithOTP } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOTP, setUseOTP] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const requestOTP = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setOtpLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/request-otp', { email: formData.email });
      if (response.data.message) {
        setOtpSent(true);
        setResendTimer(60); // 60 seconds cooldown
        startResendTimer();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const startResendTimer = () => {
    let timer = 60;
    const interval = setInterval(() => {
      timer--;
      setResendTimer(timer);
      if (timer <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (useOTP) {
        if (!formData.otp) {
          setError('Please enter the OTP sent to your email');
          setLoading(false);
          return;
        }

        // Login with OTP using AuthContext
        const result = await loginWithOTP(formData.email, formData.password, formData.otp);
        
        if (result.success) {
          navigate(result.user.role === 'farmer' ? '/farmer-dashboard' : '/consumer-dashboard');
        } else {
          setError(result.message);
        }
      } else {
        // Traditional login
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          navigate(result.user.role === 'farmer' ? '/farmer-dashboard' : '/consumer-dashboard');
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-2xl">🌾</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign In to Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back to AROVASTORE
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* OTP Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useOTP"
                  checked={useOTP}
                  onChange={(e) => setUseOTP(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="useOTP" className="ml-2 block text-sm text-gray-700">
                  Use OTP for extra security
                </label>
              </div>
              <Shield className="h-5 w-5 text-green-600" />
            </div>

            {/* OTP Section */}
            {useOTP && (
              <div className="space-y-4 border-t pt-4">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                    One-Time Password (OTP)
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      value={formData.otp}
                      onChange={handleChange}
                      className="input-field pr-24"
                      placeholder="Enter 6-digit OTP"
                    />
                    <button
                      type="button"
                      onClick={requestOTP}
                      disabled={otpLoading || resendTimer > 0}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {otpLoading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  {resendTimer > 0 && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Resend available in {resendTimer}s
                    </p>
                  )}
                  {otpSent && (
                    <p className="mt-1 text-xs text-green-600">
                      OTP sent to your email address
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-green-600 hover:text-green-500">
                  Sign up
                </Link>
              </span>
            </div>
          </div>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 border-t pt-6">
          <p className="text-center text-sm text-gray-600 mb-4">
            Demo Accounts (for testing):
          </p>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700">Farmer Account:</p>
              <p className="text-xs text-gray-600">Email: farmer@demo.com</p>
              <p className="text-xs text-gray-600">Password: demo123</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-700">Consumer Account:</p>
              <p className="text-xs text-gray-600">Email: consumer@demo.com</p>
              <p className="text-xs text-gray-600">Password: demo123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
