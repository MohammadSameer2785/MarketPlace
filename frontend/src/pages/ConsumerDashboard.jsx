import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import axios from 'axios';
import { ShoppingCart, Package, TrendingUp, Clock, CheckCircle, XCircle, Download, ExternalLink, LogOut, Sparkles } from 'lucide-react';

const ConsumerDashboard = () => {
  const { authUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    fetchOrders();
    fetchStats();
    updateCartCount();
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      updateCartCount();
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const updateCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    } catch (error) {
      console.error('Error updating cart count:', error);
      setCartCount(0);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/orders/my-orders');
      const orders = response.data;
      
      setStats({
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.totalPrice, 0),
        pendingOrders: orders.filter(order => order.status === 'pending').length,
        completedOrders: orders.filter(order => order.status === 'completed').length
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const downloadReceipt = (orderId) => {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  };

  if (loading) {
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

  if (authUser.role !== 'consumer') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600">Access denied. This page is for consumers only.</p>
          <button 
            onClick={() => window.location.href = '/farmer-dashboard'}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Go to Farmer Dashboard
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
          <h1 className="text-3xl font-bold text-gray-900">Consumer Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your orders and track purchases</p>
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
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          to="/marketplace"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow flex items-center justify-between group"
        >
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Marketplace</h3>
            <p className="text-gray-600">Discover fresh crops from local farmers</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
            <ShoppingCart className="w-6 h-6 text-green-600" />
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Cart Items</h3>
          <p className="text-gray-600 mb-4">View items in your shopping cart</p>
          <Link
            to="/cart"
            className="block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            View Cart ({cartCount})
          </Link>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crop
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Farmer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {order.crop?.image ? (
                        <img
                          src={order.crop.image}
                          alt={order.crop.name}
                          className="h-8 w-8 rounded-full object-cover mr-2"
                        />
                      ) : (
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs">🌱</span>
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.crop?.name}</div>
                        <div className="text-sm text-gray-500">{order.quantity} {order.crop?.priceUnit}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.farmer?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(order.status)}
                      <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {order.paymentStatus === 'paid' && (
                        <button
                          onClick={() => downloadReceipt(order._id)}
                          className="text-green-600 hover:text-green-900"
                          title="Download Receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      {order.receiptUrl && (
                        <a
                          href={order.receiptUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                          title="View Receipt"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-4">Start by browsing the marketplace and placing your first order</p>
              <Link
                to="/marketplace"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-block"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
