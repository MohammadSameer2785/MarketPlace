import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import VoiceInput from '../components/VoiceInput';
import { User, Mail, Phone, Lock, MapPin, Tractor, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { signup } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    address: {
      state: '',
      district: '',
      village: '',
      pincode: ''
    }
  });
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setErrors([{ msg: 'Passwords do not match' }]);
      setLoading(false);
      return;
    }

    if (!formData.role) {
      setErrors([{ msg: 'Please select a role (Farmer or Consumer)' }]);
      setLoading(false);
      return;
    }

    try {
      await signup(formData);
      
      // Redirect to respective dashboard based on role
      if (formData.role === 'farmer') {
        navigate('/farmer-dashboard');
      } else {
        navigate('/consumer-dashboard');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg || 
                          'Registration failed';
      
      // Show toast notification for better visibility
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('already exists')) {
        toast.error('Email already registered! Please login instead.');
      } else {
        toast.error(errorMessage);
      }
      
      setErrors([{ msg: errorMessage }]);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our agricultural marketplace community
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'farmer' }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'farmer'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Tractor className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'farmer' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <span className={`block text-sm font-medium ${
                    formData.role === 'farmer' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    Farmer
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Sell Crops
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, role: 'consumer' }))}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    formData.role === 'consumer'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <ShoppingBag className={`w-8 h-8 mx-auto mb-2 ${
                    formData.role === 'consumer' ? 'text-green-600' : 'text-gray-600'
                  }`} />
                  <span className={`block text-sm font-medium ${
                    formData.role === 'consumer' ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    Consumer
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    Buy Crops
                  </span>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  placeholder="mohammadsameer@gmail.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address Information
              </label>
              
              {/* Voice Input for Complete Address */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  Voice Input (Optional)
                </label>
                <VoiceInput
                  value={`${formData.address.state}, ${formData.address.district}, ${formData.address.village}, ${formData.address.pincode}`}
                  onChange={(value) => {
                    // Parse the voice input and update address fields
                    const parts = value.split(',').map(part => part.trim());
                    const [state, district, village, pincode] = parts;
                    
                    setFormData(prev => ({
                      ...prev,
                      address: {
                        state: state || prev.address.state,
                        district: district || prev.address.district,
                        village: village || prev.address.village,
                        pincode: pincode || prev.address.pincode
                      }
                    }));
                  }}
                  placeholder="Speak your complete address..."
                  lang="en"
                  className="mb-2"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <input
                  name="address.state"
                  type="text"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="State"
                />
                <input
                  name="address.district"
                  type="text"
                  value={formData.address.district}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="District"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <input
                  name="address.village"
                  type="text"
                  value={formData.address.village}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Village"
                />
                <input
                  name="address.pincode"
                  type="text"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Pincode"
                />
              </div>
            </div>
          </div>

          {/* Errors */}
          {Array.isArray(errors) && errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error.msg || error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-base"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
                Sign in
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
