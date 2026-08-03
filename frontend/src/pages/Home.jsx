import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TrendingUp, Users, ShoppingCart, Tractor, Star, MapPin, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [topCrops, setTopCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    state: '',
    district: '',
    village: ''
  });

  useEffect(() => {
    fetchTopCrops();
  }, []);

  const fetchTopCrops = async () => {
    try {
      const response = await axios.get('/api/crops/top-demanded');
      setTopCrops(response.data);
    } catch (error) {
      console.error('Failed to fetch top crops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (field, value) => {
    setSelectedLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const searchTopCrops = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedLocation.state) params.append('state', selectedLocation.state);
      if (selectedLocation.district) params.append('district', selectedLocation.district);
      if (selectedLocation.village) params.append('village', selectedLocation.village);
      
      const response = await axios.get(`/api/crops/top-demanded?${params}`);
      setTopCrops(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to search top crops:', error);
      setTopCrops([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              🌾 AROVASTORE
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Connecting Farmers Directly with Buyers - Fresh Produce, Fair Prices, No Middlemen
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
              <a
                href="/marketplace"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors inline-flex items-center justify-center cursor-pointer"
              >
                Browse Marketplace
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose AROVASTORE?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing agricultural trade with technology that benefits everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tractor className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Farmers</h3>
              <p className="text-gray-600">
                Direct access to buyers, better prices, and tools to manage your crops efficiently
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
              <p className="text-gray-600">
                Fresh produce directly from farmers, transparent pricing, and quality assurance
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Insights</h3>
              <p className="text-gray-600">
                AI-powered demand analysis to help farmers grow what's truly in demand
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Top Demanded Crops Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🔥 Top 8 Most Demanded Crops
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Discover what's trending in your area based on real-time market data
            </p>

            {/* Location Filters */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="State"
                  value={selectedLocation.state}
                  onChange={(e) => handleLocationChange('state', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <input
                type="text"
                placeholder="District"
                value={selectedLocation.district}
                onChange={(e) => handleLocationChange('district', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                placeholder="Village"
                value={selectedLocation.village}
                onChange={(e) => handleLocationChange('village', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={searchTopCrops}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {topCrops.map((crop, index) => (
                <div key={crop._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow crop-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      {crop.image ? (
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="w-12 h-12 rounded-lg object-cover mr-3"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xl">🌱</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                        <p className="text-sm text-gray-500">{crop.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-600 mr-1" />
                      <span className="text-sm font-medium text-yellow-800">#{index + 1}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-medium">₹{crop.price}/{crop.priceUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available:</span>
                      <span className="font-medium">{crop.quantity} {crop.quantityUnit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Demand Score:</span>
                      <span className="font-medium text-green-600">{Math.round(crop.demandScore || 0)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      📍 {crop.location?.village}, {crop.location?.district}
                    </div>
                  </div>

                  <Link
                    to={`/checkout/${crop._id}`}
                    className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors text-center block"
                  >
                    Order Now
                  </Link>
                </div>
              ))}
            </div>
          )}

          {!loading && topCrops.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No crops found in the selected location. Try a different search.</p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-green-100">Registered Farmers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-green-100">Happy Buyers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <div className="text-green-100">Transactions</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">100+</div>
              <div className="text-green-100">Crop Varieties</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join the Agricultural Revolution?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Whether you're a farmer looking for better prices or a buyer seeking fresh produce,
            AgriMarketplace is here to connect you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-block text-center cursor-pointer"
            >
              Register as Farmer
            </a>
            <a
              href="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block text-center cursor-pointer"
            >
              Register as Consumer
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
