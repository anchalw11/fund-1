import { useState, useEffect } from 'react';
import { Trophy, Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { supabase } from '../lib/db';

export default function MiniChallenge() {
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      fetchMiniChallenge(user.id);
    } else {
      setLoading(false);
    }
  };

  const fetchMiniChallenge = async (userId: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/mini-challenges/user/${userId}`);
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setChallenge(result.data[0]);
      }
    } catch (error) {
      console.error('Error fetching mini challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const startMiniChallenge = async () => {
    if (!user) {
      alert('Please login to start a mini challenge');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/mini-challenges/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const result = await response.json();
      if (result.success) {
        setChallenge(result.data);
      }
    } catch (error) {
      console.error('Error starting mini challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Trophy className="inline-block w-12 h-12 mr-3 text-yellow-400" />
            Free Mini Challenge
          </h1>
          <p className="text-xl text-gray-300">
            Experience our platform risk-free with a demo challenge
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-blue-500"></div>
          </div>
        ) : challenge ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Your Mini Challenge</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6">
                <DollarSign className="w-10 h-10 text-green-400 mb-2" />
                <p className="text-gray-300">Account Size</p>
                <p className="text-3xl font-bold text-white">${challenge.account_size}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <TrendingUp className="w-10 h-10 text-blue-400 mb-2" />
                <p className="text-gray-300">Profit Target</p>
                <p className="text-3xl font-bold text-green-400">${challenge.profit_target}</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <Clock className="w-10 h-10 text-purple-400 mb-2" />
                <p className="text-gray-300">Duration</p>
                <p className="text-3xl font-bold text-white">{challenge.duration_days} Days</p>
              </div>
            </div>

            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6">
              <AlertCircle className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-white font-semibold mb-2">Special Offer!</p>
              <p className="text-gray-300">Complete this challenge and get 20% off your first real challenge</p>
              <p className="text-blue-300 mt-2">Discount Code: <span className="font-mono font-bold">{challenge.discount_code}</span></p>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition">
                Continue Challenge
              </button>
              <button className="px-8 py-4 border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition">
                View Rules
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 text-center">
            <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Free Mini Challenge</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get a taste of what it's like to trade with Fund8r. No risk, no payment required.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
              <div className="bg-white/5 rounded-xl p-6">
                <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="text-white font-bold">$3,000</p>
                <p className="text-gray-400">Virtual Capital</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <Clock className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                <p className="text-white font-bold">7 Days</p>
                <p className="text-gray-400">To Complete</p>
              </div>

              <div className="bg-white/5 rounded-xl p-6">
                <TrendingUp className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                <p className="text-white font-bold">$100</p>
                <p className="text-gray-400">Profit Target</p>
              </div>
            </div>

            <button
              onClick={startMiniChallenge}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-4 rounded-xl font-bold text-xl hover:scale-105 transition shadow-xl"
            >
              Start Free Challenge Now
            </button>

            <p className="text-gray-400 mt-6">
              Complete and get 20% off your first real challenge!
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
