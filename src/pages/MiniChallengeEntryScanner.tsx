import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { QrCode, Zap, Sparkles, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MiniChallengeEntryScanner() {
  const navigate = useNavigate();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Current page URL for QR code generation - redirects to follow page
  const currentUrl = `${window.location.origin}/mini-challenge/follow`;

  useEffect(() => {
    generateQRCode();

    // Auto-redirect after showing the scanner
    const timer = setTimeout(() => {
      navigate('/mini-challenge/follow');
    }, 60000); // 60 second delay to show scanner

    return () => clearTimeout(timer);
  }, [navigate]);

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to placeholder
      setIsLoading(false);
    }
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

      <div className="relative z-10 max-w-4xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <QrCode className="w-16 h-16 text-cyan-400 animate-pulse mr-4" />
            <Star className="w-12 h-12 text-yellow-400 animate-spin mr-2" />
            <Sparkles className="w-10 h-10 text-purple-400 animate-bounce" />
          </div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            ULTRA MINI CHALLENGE
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Scan the QR code to start your challenge journey!
          </p>

          <div className="inline-block bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/30">
            <p className="text-cyan-400 font-semibold animate-pulse">
              Redirecting to community page in 60 seconds...
            </p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="text-center mb-16">
          <div className="inline-block relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 animate-pulse"></div>
            <div className="relative bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-cyan-500/30">
              <div className="flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-cyan-400 mr-2" />
                <span className="text-cyan-400 font-semibold text-lg">SCAN TO JOIN COMMUNITY</span>
              </div>

              <div className="w-80 h-80 mx-auto bg-gray-800/50 rounded-xl flex items-center justify-center">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-cyan-500/20 border-t-cyan-400"></div>
                  </div>
                ) : (
                  <div className="text-center">
                    <img
                      src={qrCodeUrl}
                      alt="Community Access QR Code"
                      className="w-64 h-64 mx-auto rounded-xl border-2 border-cyan-500/50"
                    />
                    <div className="mt-4 space-y-2">
                      <p className="text-cyan-400 font-semibold">Scan to Join Community</p>
                      <p className="text-gray-400 text-sm">Follow + Unlock Challenge</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-2 text-gray-300 text-sm">
                <p className="font-semibold text-cyan-400">First Step: Join Community</p>
                <p>Then unlock your mini-challenge</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auto Continue Message */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30">
            <h3 className="text-2xl font-bold text-white mb-3">📱 Welcome! First Follow, Then Trade</h3>
            <p className="text-gray-300 mb-4">
              To maintain quality and build our trading community, you must follow us on all social media platforms first.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-6">
              <div className="bg-green-500/10 rounded-lg p-3">
                <p className="text-green-400 font-semibold">1. Follow All Platforms</p>
                <p className="text-gray-300">Instagram, Twitter, YouTube</p>
              </div>
              <div className="bg-blue-500/10 rounded-lg p-3">
                <p className="text-blue-400 font-semibold">2. Confirm Following</p>
                <p className="text-gray-300">Check the boxes when done</p>
              </div>
              <div className="bg-purple-500/10 rounded-lg p-3">
                <p className="text-purple-400 font-semibold">3. Start Challenge</p>
                <p className="text-gray-300">$0.99 almost free access</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-cyan-400 font-semibold">
                or click below to skip the wait
              </p>
              <button
                onClick={() => navigate('/mini-challenge/follow')}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-xl font-medium hover:scale-105 transition-transform"
              >
                Continue to Community →
              </button>
            </div>
          </div>
        </div>

        {/* Benefits Preview */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-500/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">🎯 Community Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
              <div>
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-cyan-400" />
                </div>
                <p><span className="text-cyan-400 font-semibold">Daily Signals</span></p>
                <p>Pro-grade market analysis</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
                <p><span className="text-purple-400 font-semibold">Exclusive Content</span></p>
                <p>Advanced trading strategies</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                </div>
                <p><span className="text-pink-400 font-semibold">$0.99 Almost Free</span></p>
                <p>Mini-challenge access</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
