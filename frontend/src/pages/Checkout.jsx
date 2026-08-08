import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';
import { axiosInstance } from '../lib/axios';
import { ShoppingCart, IndianRupee, MapPin, User, Phone, QrCode, Check } from 'lucide-react';

const Checkout = () => {
  const { cropId } = useParams();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [crop, setCrop] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [upiConfig, setUpiConfig] = useState({});
  const [isCartCheckout, setIsCartCheckout] = useState(false);

  useEffect(() => {
    if (!authUser || authUser.role !== 'consumer') {
      navigate('/login');
      return;
    }

    if (cropId) {
      // Single item checkout
      fetchCropDetails();
    } else {
      // Cart checkout
      loadCartItems();
    }
    fetchUpiConfig();
  }, [cropId, authUser, navigate]);

  const loadCartItems = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartArray = Array.isArray(cart) ? cart : [];
      if (cartArray.length === 0) {
        navigate('/marketplace');
        return;
      }
      setCartItems(cartArray);
      setIsCartCheckout(true);
      setLoading(false);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
      navigate('/marketplace');
    }
  };

  const fetchCropDetails = async () => {
    try {
      const response = await axiosInstance.get(`/api/crops`);
      const cropData = response.data.find(c => c._id === cropId);
      if (cropData) {
        setCrop(cropData);
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Failed to fetch crop details:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpiConfig = async () => {
    try {
      const response = await axiosInstance.get('/api/upi-config');
      setUpiConfig(response.data);
    } catch (error) {
      // Set default UPI ID if fetch fails
      setUpiConfig({ upiId: 'shivanakkanagoni17@okaxis' });
    }
  };

  const calculateTotalPrice = () => {
    if (isCartCheckout) {
      return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    if (!crop) return 0;
    
    let totalPrice = crop.price * quantity;
    
    // Convert units if needed
    if (crop.priceUnit === 'quintal' && crop.quantityUnit === 'kg') {
      totalPrice = (crop.price / 100) * quantity;
    } else if (crop.priceUnit === 'kg' && crop.quantityUnit === 'quintal') {
      totalPrice = crop.price * quantity * 100;
    }
    
    return totalPrice;
  };

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      // Ensure UPI ID is set
      const upiId = upiConfig.upiId || 'shivanakkanagoni17@okaxis';
      
      if (isCartCheckout) {
        // Place orders for all cart items
        for (const item of cartItems) {
          await axiosInstance.post('/api/orders', {
            cropId: item.cropId,
            quantity: Number(item.quantity),
            upiId: upiId
          });
        }
        // Clear cart after successful orders
        localStorage.setItem('cart', JSON.stringify([]));
        window.dispatchEvent(new Event('cart-updated'));
        setOrderPlaced(true);
        // For cart checkout, redirect to consumer dashboard since multiple orders are placed
        setTimeout(() => {
          navigate('/consumer-dashboard');
        }, 2000);
      } else {
        // Single item checkout
        if (quantity > crop.quantity) {
          alert('Requested quantity exceeds available quantity!');
          return;
        }

        const response = await axiosInstance.post('/api/orders', {
          cropId: crop._id,
          quantity: Number(quantity),
          upiId: upiId
        });

        setOrderId(response.data._id);
        setOrderPlaced(true);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      if (error.response) {
        console.error('Error status:', error.response.status);
        console.error('Error data:', JSON.stringify(error.response.data, null, 2));
        console.error('Error headers:', error.response.headers);
        const errorMessage = error.response.data?.message || 
                           error.response.data?.errors?.[0]?.msg || 
                           error.response.data?.error || 
                           'Unknown error';
        alert(`Failed to place order: ${errorMessage}`);
      } else {
        console.error('Network error:', error.message);
        alert(`Failed to place order: ${error.message}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    setProcessing(true);
    try {
      await axiosInstance.put(`/api/orders/${orderId}/payment`, {
        paymentId: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!isCartCheckout && !crop) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Crop not found</h2>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600 mt-2">Complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Order Details
          </h2>

          <div className="space-y-4">
            {isCartCheckout ? (
              // Cart Items Display
              Array.isArray(cartItems) && cartItems.map((item) => (
                <div key={item.cropId} className="flex items-start space-x-4 pb-4 border-b">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">🌱</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">Farmer: {item.farmer?.name || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      <span className="font-bold">{item.price}</span>
                      <span className="text-sm text-gray-600">/{item.priceUnit}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      <span className="font-bold">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Single Crop Display
              <div className="flex items-start space-x-4 pb-4 border-b">
                {crop.image ? (
                  <img
                    src={crop.image}
                    alt={crop.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-3xl">🌱</span>
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                  <p className="text-sm text-gray-600">Farmer: {crop.farmer?.name || 'Unknown'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <IndianRupee className="w-4 h-4 text-gray-600" />
                    <span className="font-bold">{crop.price}</span>
                    <span className="text-sm text-gray-600">/{crop.priceUnit}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Available: {crop.quantity} {crop.quantityUnit}</p>
                </div>
              </div>
            )}

            {/* Quantity Selection - only for single item checkout */}
            {!isCartCheckout && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity ({crop.quantityUnit})
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 pt-4 border-t">
              {isCartCheckout ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({cartItems.length}):</span>
                    <span className="font-medium">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per {crop.priceUnit}:</span>
                    <span className="font-medium">₹{crop.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{quantity} {crop.quantityUnit}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                <span>Total Price:</span>
                <span className="text-green-600">₹{calculateTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            {/* Location - only for single item */}
            {!isCartCheckout && (
              <div className="pt-4 border-t">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{crop.location?.village}, {crop.location?.district}, {crop.location?.state}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

          {!orderPlaced ? (
            <div className="space-y-6">
              {/* Farmer Info - only for single item checkout */}
              {!isCartCheckout && crop && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Farmer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{crop.farmer?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span>{crop.farmer?.phone || 'Not available'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Farmers Info for cart checkout */}
              {isCartCheckout && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Farmers Information</h3>
                  <div className="space-y-2 text-sm">
                    {Array.isArray(cartItems) && cartItems.map((item, index) => (
                      <div key={item.cropId} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{item.farmer?.name || 'Unknown'}</span>
                        </div>
                        <span className="text-gray-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* UPI Payment */}
              <div>
                <h3 className="font-medium mb-4">Pay via UPI</h3>
                
                {/* QR Code */}
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-4">
                  <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Scan QR code with any UPI app</p>
                  <div className="bg-white rounded-lg p-3 inline-block">
                    <p className="font-mono text-sm">{upiConfig.upiId}</p>
                  </div>
                </div>

                {/* UPI Apps */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <div key={app} className="text-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="w-8 h-8 bg-green-100 rounded-lg mx-auto mb-1"></div>
                      <span className="text-xs">{app}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || (!isCartCheckout && quantity > (crop?.quantity || 0))}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing this order, you agree to pay the farmer directly via UPI
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Confirmation */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <Check className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  {isCartCheckout ? 'Orders Placed Successfully!' : 'Order Placed Successfully!'}
                </h3>
                {!isCartCheckout && (
                  <p className="text-green-700 mb-4">
                    Order ID: {orderId}
                  </p>
                )}
                <p className="text-sm text-green-600">
                  {isCartCheckout 
                    ? 'Your orders have been placed. Redirecting to dashboard...'
                    : 'Please complete the payment by scanning the QR code above'
                  }
                </p>
              </div>

              {/* Payment Confirmation Button - only for single item checkout */}
              {!isCartCheckout && (
                <div>
                  <h3 className="font-medium mb-2">Payment Done?</h3>
                  <button
                    onClick={handlePaymentConfirmation}
                    disabled={processing}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {processing ? 'Confirming...' : 'Confirm Payment'}
                </button>
              </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => navigate('/consumer-dashboard')}
                  className="text-green-600 hover:text-green-700 text-sm"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
