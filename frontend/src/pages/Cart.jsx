import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, IndianRupee, ArrowRight } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(Array.isArray(cartData) ? cartData : []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (cropId) => {
    try {
      const updatedCart = cart.filter(item => item.cropId !== cropId);
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = (cropId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      const updatedCart = cart.map(item => 
        item.cropId === cropId ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
      localStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    try {
      setCart([]);
      localStorage.setItem('cart', JSON.stringify([]));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
        <p className="text-gray-600">Review items in your cart before checkout</p>
      </div>

      {cart.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items from the marketplace to get started</p>
          <Link
            to="/marketplace"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
          >
            Browse Marketplace
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.cropId} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">🌱</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Farmer: {item.farmer?.name || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      <span className="text-lg font-bold text-gray-900">{item.price}</span>
                      <span className="text-sm text-gray-600">/{item.priceUnit}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.cropId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cropId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.cropId)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <div className="flex items-center justify-end gap-1">
                      <IndianRupee className="w-4 h-4 text-gray-600" />
                      <span className="text-xl font-bold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>{getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={clearCart}
                className="w-full mb-3 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Clear Cart
              </button>

              <Link
                to="/marketplace"
                className="block w-full mb-3 border border-green-600 text-green-600 py-2 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                Continue Shopping
              </Link>

              <Link
                to="/checkout"
                className="block w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold text-center"
                style={{ pointerEvents: cart.length === 0 ? 'none' : 'auto', opacity: cart.length === 0 ? 0.5 : 1 }}
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
