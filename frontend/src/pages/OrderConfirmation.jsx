import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import axios from 'axios';
import { Check, Download, IndianRupee, MapPin, User, Calendar, Receipt } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(`/api/orders/my-orders`);
      const orderData = response.data.find(o => o._id === orderId);
      if (orderData) {
        setOrder(orderData);
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    // Open receipt in new tab for printing/saving
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
        <button
          onClick={() => navigate('/marketplace')}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-lg text-gray-600">Your order has been confirmed</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Receipt className="w-5 h-5 mr-2" />
            Order Details
          </h2>

          <div className="space-y-4">
            {/* Order ID */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">{order._id}</span>
            </div>

            {/* Date */}
            <div className="flex justify-between items-center pb-3 border-b">
              <span className="text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Order Date:
              </span>
              <span className="font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Crop Details */}
            <div className="pb-3 border-b">
              <h3 className="font-medium mb-2">Crop Information</h3>
              <div className="flex items-start space-x-3">
                {order.crop?.image ? (
                  <img
                    src={order.crop.image}
                    alt={order.crop.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">🌱</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{order.crop?.name}</p>
                  <p className="text-sm text-gray-600">{order.quantity} {order.crop?.priceUnit}</p>
                  <p className="text-sm text-gray-600">
                    ₹{order.crop?.price}/{order.crop?.priceUnit}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>₹{order.totalPrice}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total Paid:</span>
                <span className="text-green-600">₹{order.totalPrice}</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Payment & Contact Details */}
        <div className="space-y-6">
          {/* Payment Details */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{order.paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UPI ID:</span>
                <span className="font-medium">{order.upiId}</span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Seller Information</h2>
            
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-3 text-gray-500" />
                <div>
                  <p className="font-medium">{order.farmer?.name}</p>
                  <p className="text-sm text-gray-600">Farmer</p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 mr-3 text-gray-500">📞</span>
                <span className="text-sm">{order.farmer?.phone}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-3 text-gray-500 mt-1" />
                <span className="text-sm">
                  {order.farmer?.address?.village}, {order.farmer?.address?.district}, {order.farmer?.address?.state}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={downloadReceipt}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Receipt
            </button>
            
            <button
              onClick={() => navigate('/consumer-dashboard')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Your order has been confirmed and the farmer has been notified</li>
          <li>• Keep this receipt for your records</li>
          <li>• The farmer will contact you for delivery arrangements</li>
          <li>• For any issues, please contact the farmer directly using the provided contact information</li>
        </ul>
      </div>
    </div>
  );
};

export default OrderConfirmation;
