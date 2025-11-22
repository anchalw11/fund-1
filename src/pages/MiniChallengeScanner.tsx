import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { supabase } from '../lib/db';
import { QrCode, Zap, Shield, Trophy, Clock, DollarSign, Star, ArrowRight, Sparkles, Instagram, Twitter, Youtube, MessageCircle, Check, ExternalLink } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function MiniChallengeScanner() {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [challengeCreated, setChallengeCreated] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // Current page URL for QR code generation
  const currentUrl = `${window.location.origin}/mini-challenge/start`;

  useEffect(() => {
    generateQRCode();
    checkAuth();

    // Check URL parameters for payment success
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success' && user) {
      createMiniChallenge();
    }
  }, []);

  useEffect(() => {
    // Handle post-login flow
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');

      if (paymentStatus === 'success') {
        createMiniChallenge();
      }
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(currentUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00ff88',
          light: '#0a0a0a'
        }
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMiniChallenge = async () => {
    if (!user || !supabase) return;

    setIsProcessing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_URL}/mini-challenges/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          payment_verified: true
        })
      });

      const result = await response.json();
      if (result.success) {
        setChallengeCreated(true);
        navigate('/mini-challenge');
      } else {
        alert(result.error || 'Failed to create mini challenge');
      }
    } catch (error) {
      console.error('Error creating mini challenge:', error);
      alert('Error creating mini challenge. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePurchase = () => {
    // Always redirect to login/signup page first, regardless of login status
    navigate('/login', {
      state: {
        fromMiniChallenge: true
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Zap className="w-16 h-16 text-cyan-400 animate-pulse mr-4" />
            <Star className="w-12 h-12 text-yellow-400 animate-spin mr-2" />
            <Sparkles className="w-10 h-10 text-purple-400 animate-bounce" />
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ULTRA MINI CHALLENGE
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            your $0.99 mini-challenge experience details and rules
          </p>

          <div className="flex items-center justify-center mt-6 mb-4">
            <button
              onClick={handlePurchase}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold text-xl flex items-center hover:scale-105 transition-transform cursor-pointer"
            >
              <DollarSign className="w-6 h-6 mr-2" />
              $0.99 MINI CHALLENGE
            </button>
          </div>
        </div>



        {/* Challenge Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* Left Column - Challenge Stats */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Trophy className="w-8 h-8 text-yellow-400 mr-3" />
              Challenge Parameters
            </h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20">
                <div className="flex items-center mb-3">
                  <DollarSign className="w-6 h-6 text-green-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Account Size</h3>
                </div>
                <p className="text-4xl font-bold text-cyan-400">$3,000</p>
                <p className="text-gray-400 mt-2">Virtual trading capital</p>
              </div>

              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-green-500/20">
                <div className="flex items-center mb-3">
                  <Trophy className="w-6 h-6 text-yellow-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Profit Target</h3>
                </div>
                <p className="text-4xl font-bold text-green-400">$200</p>
                <p className="text-gray-400 mt-2">6.67% profit requirement</p>
              </div>

              <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <div className="flex items-center mb-3">
                  <Clock className="w-6 h-6 text-purple-400 mr-3" />
                  <h3 className="text-xl font-bold text-white">Time Limit</h3>
                </div>
                <p className="text-4xl font-bold text-purple-400">7 Days</p>
                <p className="text-gray-400 mt-2">Complete challenge duration</p>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Rules */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <Shield className="w-8 h-8 text-blue-400 mr-3" />
              Challenge Rules & Benefits
            </h2>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
                <h3 className="text-lg font-bold text-white mb-3">Challenge Rules</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <strong className="text-white">Capital:</strong> $3,000</li>
                  <li>• <strong className="text-white">Time:</strong> 7 Days</li>
                  <li>• <strong className="text-white">Target:</strong> 6.67% ($200 profit)</li>
                  <li>• <strong className="text-white">Cost:</strong> $0.99 <span className="text-sm text-gray-400">almost</span> <span className="text-green-400 font-bold bg-green-500/20 px-1 rounded">FREE</span></li>
                  <li>• <strong className="text-white">Max Drawdown:</strong> 5%</li>
                  <li>• <strong className="text-white">Daily Drawdown:</strong> 3%</li>
                  <li>• <strong className="text-white">Max Daily Gain:</strong> 2%</li>
                  <li>• <strong className="text-white">Per Trade Risk:</strong> 0.5%</li>
                  <li>• <strong className="text-white">Stop Loss:</strong> Can't move stop loss when it's about to hit</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
                <h3 className="text-lg font-bold text-white mb-3">Premium Benefits</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <span className="text-cyan-400 font-semibold">Advanced Analytics</span> Dashboard</li>
                  <li>• <span className="text-cyan-400 font-semibold">Real-time Performance</span> Tracking</li>
                  <li>• <span className="text-cyan-400 font-semibold">Expert Support</span> Access</li>
                  <li>• <span className="text-cyan-400 font-semibold">Completion Certificate</span> on Success</li>
                  <li>• <span className="text-cyan-400 font-semibold">20% Discount</span> on Full Challenges</li>
                </ul>
              </div>

              <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 backdrop-blur-xl rounded-xl p-6 border border-yellow-500/20">
                <h3 className="text-lg font-bold text-white mb-3">Success Rewards</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• <span className="text-yellow-400 font-semibold">Completion Badge</span> Achievement</li>
                  <li>• <span className="text-yellow-400 font-semibold">$50,000 Challenge Discount</span></li>
                  <li>• <span className="text-yellow-400 font-semibold">Priority Support</span> Channel</li>
                  <li>• <span className="text-yellow-400 font-semibold">Featured on Leaderboard</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <button
            onClick={handlePurchase}
            className="inline-flex items-center bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white px-12 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-all duration-300 shadow-2xl group"
          >
            <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
            Start Your Challenge Now
            <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition" />
          </button>

          <div className="mt-8 bg-gradient-to-r from-orange-900/20 to-red-900/20 backdrop-blur-xl rounded-xl p-6 border border-orange-500/20 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center">
              <Trophy className="w-5 h-5 text-orange-400 mr-2" />
              Profit Share Rule
            </h3>
            <p className="text-gray-300 text-sm mb-3">
              Make a profit above $200 to be eligible for a reward. You will receive <span className="text-orange-400 font-bold">15% of any profit amount exceeding $200</span>.
            </p>
            <div className="bg-black/30 rounded-lg p-3 border border-orange-500/30">
              <p className="text-orange-300 font-semibold text-sm mb-1">Example:</p>
              <p className="text-gray-200 text-sm">
                With an initial capital of $3,000, if you make a profit of $250, the profit exceeding the threshold is $50. You will receive <span className="text-green-400 font-bold">15% of $50, which is $7.50</span>.
              </p>
            </div>
          </div>

          <p className="text-gray-400 mt-6 text-sm">
            $0.99 Mini Challenge • Instant Access via Razorpay
          </p>

          {!user && (
            <p className="text-cyan-400 mt-2 text-sm">
              New user? You'll be redirected to sign up first, then to payment.
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-500/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Why Choose Our Mini Challenge?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-cyan-400" />
                </div>
                <p><span className="text-cyan-400 font-semibold">Industry Leading</span> Platform</p>
                <p className="mt-2">Powered by advanced trading technology and real-time market data.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <p><span className="text-purple-400 font-semibold">100% Secure</span> Environment</p>
                <p className="mt-2">Bank-level security encryption and fraud protection.</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-pink-400" />
                </div>
                <p><span className="text-pink-400 font-semibold">Proven Success</span> Rate</p>
                <p className="mt-2">Thousands of successful traders started with our mini challenges.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
