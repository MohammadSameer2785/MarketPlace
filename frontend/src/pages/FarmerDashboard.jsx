import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, Edit, Package, TrendingUp, Users, IndianRupee, LogOut, Sparkles } from 'lucide-react';

const FarmerDashboard = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCrops: 0,
    totalValue: 0,
    totalOrders: 0,
    activeCrops: 0
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    priceUnit: 'kg',
    quantityUnit: 'kg',
    description: '',
    category: 'other',
    location: {
      state: authUser?.address?.state || '',
      district: authUser?.address?.district || '',
      village: authUser?.address?.village || ''
    },
    image: null
  });

  useEffect(() => {
    fetchCrops();
    fetchStats();
  }, []);

  const fetchCrops = async () => {
    try {
      const response = await axios.get('/api/crops/my-crops');
      setCrops(response.data);
    } catch (error) {
      console.error('Failed to fetch crops:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [cropsResponse, ordersResponse] = await Promise.all([
        axios.get('/api/crops/my-crops'),
        axios.get('/api/orders/farmer-orders')
      ]);

      const crops = Array.isArray(cropsResponse.data) ? cropsResponse.data : [];
      const orders = Array.isArray(ordersResponse.data) ? ordersResponse.data : [];

      setStats({
        totalCrops: crops.length,
        totalValue: crops.reduce((sum, crop) => sum + (crop.price * crop.quantity), 0),
        totalOrders: orders.length,
        activeCrops: crops.filter(crop => crop.isActive && crop.quantity > 0).length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'location') {
          Object.keys(formData[key]).forEach(subKey => {
            if (formData[key][subKey]) {
              formDataToSend.append(`${key}.${subKey}`, formData[key][subKey]);
            }
          });
        } else if (key === 'image') {
          // Only add image if it's a file (not null)
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
          // If no image selected, don't add anything (image is optional)
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (editingCrop) {
        await axios.put(`/api/crops/${editingCrop._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        await axios.post('/api/crops', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      fetchCrops();
      fetchStats();
      setShowAddForm(false);
      setEditingCrop(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save crop:', error.response?.data || error.message);
      
      // Show user-friendly error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save crop';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop?')) {
      try {
        await axios.delete(`/api/crops/${cropId}`);
        fetchCrops();
        fetchStats();
      } catch (error) {
        console.error('Failed to delete crop:', error);
      }
    }
  };

  const handleEdit = (crop) => {
    setEditingCrop(crop);
    setFormData({
      name: crop.name,
      price: crop.price,
      quantity: crop.quantity,
      priceUnit: crop.priceUnit,
      quantityUnit: crop.quantityUnit,
      description: crop.description,
      category: crop.category,
      location: crop.location,
      image: null // Reset image when editing
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      priceUnit: 'kg',
      quantityUnit: 'kg',
      description: '',
      category: 'other',
      location: {
        state: authUser?.address?.state || '',
        district: authUser?.address?.district || '',
        village: authUser?.address?.village || ''
      },
      image: null
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  if (loading && crops.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600">Please login to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (authUser.role !== 'farmer') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600">Access denied. This page is for farmers only.</p>
          <button 
            onClick={() => window.location.href = '/consumer-dashboard'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Consumer Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your crops and track sales</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/ai-assistant')}
            className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md"
          >
            <Sparkles className="w-5 h-5" />
            Ask Bujji
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Crops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCrops}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <IndianRupee className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Crops</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCrops}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Crop Button */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingCrop(null);
            resetForm();
          }}
          className="btn btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Crop
        </button>
      </div>

      {/* Add/Edit Crop Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingCrop ? 'Edit Crop' : 'Add New Crop'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="vegetables">Vegetables</option>
                  <option value="fruits">Fruits</option>
                  <option value="grains">Grains</option>
                  <option value="pulses">Pulses</option>
                  <option value="spices">Spices</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field flex-1"
                    placeholder="0.00"
                  />
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleInputChange}
                    className="input-field w-20"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity Available
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-field flex-1"
                    placeholder="0.00"
                  />
                  <select
                    name="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={handleInputChange}
                    className="input-field w-20"
                  >
                    <option value="kg">kg</option>
                    <option value="quintal">quintal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="location.state"
                  value={formData.location.state}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  District
                </label>
                <input
                  type="text"
                  name="location.district"
                  value={formData.location.district}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="District"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Village
                </label>
                <input
                  type="text"
                  name="location.village"
                  value={formData.location.village}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Village"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="input-field"
                  placeholder="Describe your crop quality, variety, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-field"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : (editingCrop ? 'Update Crop' : 'Add Crop')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCrop(null);
                  resetForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Crops List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">My Crops</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crops.map((crop) => (
                <tr key={crop._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {crop.image && (
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{crop.name}</div>
                        <div className="text-sm text-gray-500">{crop.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ₹{crop.price}/{crop.priceUnit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {crop.quantity} {crop.quantityUnit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {crop.location?.village}, {crop.location?.district}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      crop.isActive && crop.quantity > 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {crop.isActive && crop.quantity > 0 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(crop)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(crop._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {crops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No crops added yet. Add your first crop to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
