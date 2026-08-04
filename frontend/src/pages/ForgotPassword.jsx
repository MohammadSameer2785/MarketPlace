import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Clock } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axiosInstance.post('/api/auth/forgot-password', { email });
      toast.success(response.data.message);
      setOtpSent(true);
      setResendTimer(60);
      startResendTimer();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
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

  const handleResend = () => {
    handleSubmit(new Event('submit'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive a password reset OTP
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {otpSent && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-800">
                  OTP sent to your email address. Check your inbox and spam folder.
                </p>
                {resendTimer > 0 && (
                  <p className="mt-2 text-xs text-green-600 flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Resend available in {resendTimer}s
                  </p>
                )}
                {resendTimer === 0 && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
              </button>
            </div>

            {otpSent && (
              <div className="text-center">
                <Link
                  to="/reset-password"
                  state={{ email }}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Proceed to Reset Password →
                </Link>
              </div>
            )}

            <div className="text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
