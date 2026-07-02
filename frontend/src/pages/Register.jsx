import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceInput from '../components/VoiceInput';
import offlineService from '../services/offlineService';
import { User, Mail, Phone, Lock, MapPin, Tractor, ShoppingBag, Wifi, WifiOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const { t, isOnline, getVoiceLanguage } = useLanguage();
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
  const [saveStatus, setSaveStatus] = useState(''); // 'saved', 'synced', ''

  useEffect(() => {
    // Check for saved form data when coming back online
    if (isOnline) {
      checkSavedForms();
    }
  }, [isOnline]);

  const checkSavedForms = async () => {
    try {
      const savedForms = await offlineService.getUnsavedForms();
      const registerForm = savedForms.find(form => form.type === 'register');
      if (registerForm) {
        setFormData(registerForm.data);
        setSaveStatus('saved');
      }
    } catch (error) {
      console.error('Failed to check saved forms:', error);
    }
  };

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
      setErrors([{ msg: t('passwordsDoNotMatch') || 'Passwords do not match' }]);
      setLoading(false);
      return;
    }

    if (!formData.role) {
      setErrors([{ msg: t('selectRoleRequired') || 'Please select a role (Farmer or Consumer)' }]);
      setLoading(false);
      return;
    }

    if (isOnline) {
      // Online registration
      const result = await register(formData);
      
      if (result.success) {
        // Clear saved form if exists
        try {
          const savedForms = await offlineService.getUnsavedForms();
          const registerForm = savedForms.find(form => form.type === 'register');
          if (registerForm) {
            await offlineService.markFormAsSynced(registerForm.id);
          }
        } catch (error) {
          console.error('Failed to clear saved form:', error);
        }
        
        navigate(result.user.role === 'farmer' ? '/farmer-dashboard' : '/consumer-dashboard');
      } else {
        setErrors(result.errors);
      }
    } else {
      // Offline mode - save form data
      try {
        await offlineService.saveFormData(formData, 'register');
        await offlineService.addToSyncQueue('register', formData);
        setSaveStatus('saved');
        setErrors([{ msg: t('dataSaved') + '. ' + t('syncWhenOnline') }]);
      } catch (error) {
        console.error('Failed to save form data:', error);
        setErrors([{ msg: 'Failed to save data offline' }]);
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Offline/Online Indicator */}
        <div className="flex justify-center mb-4">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4 mr-1" />
                {t('online') || 'Online'}
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 mr-1" />
                {t('offlineMode')}
              </>
            )}
          </div>
        </div>

        {/* Saved Form Status */}
        {saveStatus === 'saved' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <WifiOff className="w-5 h-5 text-yellow-600 mr-2" />
              <div className="text-sm text-yellow-800">
                {t('dataSaved')}. {t('syncWhenOnline')}.
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t('createAccount')}
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
                {t('selectRole')}
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
                    {t('farmer')}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {t('sellCrops')}
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
                    {t('consumer')}
                  </span>
                  <span className="block text-xs text-gray-500 mt-1">
                    {t('buyCrops')}
                  </span>
                </button>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('fullName')}
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
                {t('emailAddress')}
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                {t('phoneNumber')}
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
                {t('addressInfo')}
              </label>
              
              {/* Voice Input for Complete Address */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">
                  {t('voiceInput')} ({t('optional') || 'Optional'})
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
                  placeholder={t('speakAddress') || 'Speak your complete address...'}
                  lang={getVoiceLanguage()}
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
                  placeholder={t('state')}
                />
                <input
                  name="address.district"
                  type="text"
                  value={formData.address.district}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('district')}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <input
                  name="address.village"
                  type="text"
                  value={formData.address.village}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('village')}
                />
                <input
                  name="address.pincode"
                  type="text"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={t('pincode')}
                />
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error.msg}</li>
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
